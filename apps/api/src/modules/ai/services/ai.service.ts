import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';
import { MarkdownMemoryService } from '../memory/markdown-memory.service';
import { InMemCacheService } from '../memory/in-mem-cache.service';
import { DynamicMemoryService } from '../memory/dynamic-memory.service';
import { IdentityService } from './identity.service';
import { SearchService } from './search.service';

@Injectable()
export class AIService {
  private readonly client: BedrockRuntimeClient;
  private readonly modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';

  constructor(
    private readonly markdownMemory: MarkdownMemoryService,
    private readonly inMemCache: InMemCacheService,
    private readonly dynamicMemory: DynamicMemoryService,
    private readonly identityService: IdentityService,
    private readonly searchService: SearchService,
  ) {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
  }

  private shouldSearch(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();

    // Don't search for basic date/time questions - we already provide this in the system prompt
    const dateTimeQueries = [
      'qué día',
      'que dia',
      'qué hora',
      'que hora',
      'what day',
      'what time',
      'today is',
      'hoy es',
    ];
    if (dateTimeQueries.some((q) => lowerPrompt.includes(q))) {
      return false;
    }

    // Only search if the query explicitly asks for current/live data
    const searchTriggers = [
      'precio actual',
      'current price',
      'precio de',
      'price of',
      'últimas noticias',
      'latest news',
      'noticias de hoy',
      'news today',
      'clima actual',
      'current weather',
      'temperatura en',
      'temperature in',
      'cotización',
      'exchange rate',
      'tasa de cambio',
      'resultados de',
      'results of',
      'marcador',
      'score',
      'qué pasó hoy',
      'what happened today',
      'eventos de hoy',
    ];

    return searchTriggers.some((trigger) => lowerPrompt.includes(trigger));
  }

  async generateResponse(
    userId: string,
    conversationId: string,
    prompt: string,
    provider: string = 'nuxt',
  ): Promise<{ response: string; options: string[] }> {
    // 1. Get bot identity
    const identity = await this.identityService.getIdentity(userId);

    // 2. Get recent context from cache
    const recentContext = this.inMemCache.getRecentContext(conversationId);

    // 3. Detect memory action
    const memoryAction = this.dynamicMemory.detectMemoryAction(prompt);

    // 4. Load relevant memories if listing
    let memoriesContext = '';
    if (memoryAction.action === 'list' && memoryAction.type) {
      const memories = await this.dynamicMemory.getMemory(
        userId,
        memoryAction.type,
      );
      if (memories) {
        memoriesContext = `\n\nCurrent ${memoryAction.type}:\n${memories}`;
      } else {
        memoriesContext = `\n\nYou have no ${memoryAction.type} saved yet.`;
      }
    }

    // 5. Perform web search if needed
    let searchResults = '';
    if (this.shouldSearch(prompt)) {
      searchResults = await this.searchService.search(prompt);
    }

    // 6. Prepare full prompt with identity, date, search results, and context
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const identityText = `
      ## Identity:
      Eres un asistente virtual, pensado y programado para las tareas días de una persona. Tu nombre es ${identity.name} y tu personalidad se describe así: ${identity.personality}, cuando el usuario te salude o sea un nuevo día debes que saludarlo de la siguiente maneta "${identity.greeting}", ya que fue la manera en que el usuario desea que lo saludes. Perteneces a la plataforma Aether. Tu función principal es ayudar a los usuarios a organizar su día, responder preguntas, y proporcionar información útil de manera amigable y eficiente. Siempre debes mantener una actitud servicial, positiva y profesional.
    `;
    const dateInstruction = `
      ## Current Date and Time:
      La fecha y hora actual es ${dateStr}. Usa esta información para responder preguntas relacionadas con el tiempo, programar eventos, o cualquier consulta que requiera conocimiento de la fecha actual.
      ## Ubicación:
      El usuario se encuentra en Colombia, por lo que la zona horaria a considerar es GMT-5. Ten esto en cuenta para cualquier consulta relacionada con horarios, eventos locales, o información dependiente de la ubicación.
      ## Idioma:
      El usuario prefiere comunicarse en español, así que siempre responde en español a menos que se te indique lo contrario.
    `;

    let formatResponse = '';
    if (provider === 'nuxt') {
      formatResponse = `\n\nCuando respondas, si es relevante, incluye una sección de "Options:[option1, option2, ...]" al final de tu respuesta con opciones claras para que el usuario elija su próximo paso. Asegúrate de que las opciones estén entre corchetes y separadas por comas, este listado de opciones debe que estar exactamente en el formato indicado.`;
    }

    const contextPlataforma = `\n\n
      ## Plataforma:
      Aether es una plataforma pensada para ayudar al usuario, por medio del chat la plataforma debe que poder resolver las solicitudes dadas por el usuario, no se debe que sugerir el uso de plataformas externas, todo se debe que resolver desde Aether.
      `;

    let systemInstructions = `${identityText}\n\n${dateInstruction}\n\n${contextPlataforma}\n\n${formatResponse}`;

    // Add strict anti-hallucination rules when search results are present
    if (searchResults) {
      systemInstructions += `\n\nIMPORTANT: I have provided you with web search results below. Use ONLY the information from these search results to answer questions about current events, prices, or real-time data. If the search results don't contain the answer, simply say you don't have that information. Be natural and conversational - don't mention that you're reading from search results unless asked. Cite sources naturally when relevant.`;
    }

    let contextSection = `Recent conversation history:\n${recentContext}${memoriesContext}`;
    if (searchResults) {
      contextSection = `Web Search Results:\n${searchResults}\n\n${contextSection}`;
    }

    const fullPrompt = `Below are system instructions and conversation history.\n\nSystem: ${systemInstructions}\n\n${contextSection}\n\nHuman: ${prompt}\n\nAssistant:`;

    const input: InvokeModelCommandInput = {
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      }),
    };

    try {
      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);
      const resBody = JSON.parse(new TextDecoder().decode(response.body));
      const aiResponse = resBody.content[0].text;

      // 7. Save to memory systems
      await this.markdownMemory.saveMessage(
        userId,
        conversationId,
        'user',
        prompt,
      );
      await this.markdownMemory.saveMessage(
        userId,
        conversationId,
        'assistant',
        aiResponse,
      );

      this.inMemCache.addToCache(conversationId, 'user', prompt);
      this.inMemCache.addToCache(conversationId, 'assistant', aiResponse);

      // 8. Save to dynamic memory if adding
      if (memoryAction.action === 'add' && memoryAction.type) {
        // Extract clean content from prompt (remove trigger words)
        const cleanContent = prompt
          .replace(
            /guardar|save|recordar|remember|anotar|note|agregar|add|crear|create|apuntar|write down/gi,
            '',
          )
          .replace(/tarea|task|nota|reminder|recordatorio/gi, '')
          .replace(/:/g, '')
          .trim();
        await this.dynamicMemory.saveMemory(
          userId,
          memoryAction.type,
          cleanContent,
        );
      }
      return this.parseIAResponse(aiResponse);
    } catch (error) {
      console.error('AWS Bedrock error:', error);
      throw new InternalServerErrorException('Failed to generate AI response');
    }
  }

  private parseIAResponse(response: string): {
    response: string;
    options: string[];
  } {
    // Regex para detectar variaciones de "Options:" o "Opciones:"
    // Captura: Options, Opciones, Opctions (typo), Quick Options, etc.
    const optionsRegex =
      /\n?\*?\*?(Quick\s+)?(Options?|Opciones?|Opctions?)[\s:]*\*?\*?\s*\[(.+?)\]\s*$/is;

    const match = response.match(optionsRegex);

    if (!match) {
      // No se encontraron opciones
      return {
        response: response.trim(),
        options: [],
      };
    }

    // Extraer el contenido entre corchetes
    const optionsString = match[3];

    // Dividir las opciones por comas
    const options = optionsString
      .split(',')
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);

    // Limpiar el texto removiendo la sección de opciones
    const cleanText = response.replace(optionsRegex, '').trim();

    return {
      response: cleanText,
      options,
    };
  }
}
