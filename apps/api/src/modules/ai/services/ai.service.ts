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
import { TasksDataService } from './tasks-data.service';
import { NotesDataService } from './notes-data.service';
import { TasksService } from '../../tasks/tasks.service';
import { NotesService } from '../../notes/notes.service';

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
    private readonly tasksData: TasksDataService,
    private readonly notesData: NotesDataService,
    private readonly tasksService: TasksService,
    private readonly notesService: NotesService,
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

    // 6. Load Task & Note Context
    const taskData = await this.tasksData.getFormattedTasks(userId);
    const noteData = await this.notesData.getFormattedNotes(userId);

    // 7. Prepare full prompt with identity, date, search results, and context
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
      IMPORTANTE: El año actual es ${new Date().getFullYear()}. NO uses 2023, 2024 ni 2025. Asegúrate de que cualquier fecha futura que generes sea coherente con el año ${new Date().getFullYear()}. 
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

      ## Memory System (IMPORTANT):
      You have the ability to save important information to the user's memory files. When the user asks you to save a task, note, or reminder, or when you detect critical information that should be persisted, you MUST include a specific command in your response.
      
      Command Format: [MEMORY:TYPE:CONTENT]
      
      Available Types:
      - TASK: For to-do items and tasks.
      - NOTE: For general notes, summaries, or important info.
      - REMINDER: For things the user needs to remember.
      
      Examples:
      - User: "Recuérdame comprar leche." -> Response: "Entendido. [MEMORY:TASK:Comprar leche]"
      - User: "Guarda esta nota." -> Response: "Guardado. [MEMORY:NOTE:Contenido de la nota]"
      
      Rules:
      1. Use the command at the end of your response.
      2. The content inside the command must be concise.
      3. Do NOT mention the command syntax to the user.
      4. BE CONCISE. Avoid long introductions like "¡Claro que sí!". Just answer the request directly.
      5. NEVER simulate the user's response. Stop speaking immediately after your turn.
      `;

    const taskSystemContext = `
      ## Task Management System:
      You have access to the user's task list and you can create or modify tasks.
      Es importante que tengas encuenta que la fecha actual es ${dateStr}, por lo que debes que usar esta fecha para cualquier tarea que se te pida crear o modificar. La fecha actual en formato unix es ${now.getTime()}. Para tareas que no le indiquen una fecha, debes que usar la fecha actual, para calcular fechas futuras o pasadas debes que usar la fecha actual como base.
      
      ### Task Interface:
      \`\`\`typescript
      interface Task {
        title: string;
        project?: string;
        description?: string;
        category: string;
        status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
        priority: 1 | 2 | 3;
        duration: string; // e.g., "30 min", "1h"
        tagColor: string; // "red", "amber", "emerald", "blue", "purple"
        scheduledAt: number; // Unix timestamp in milliseconds
      }
      \`\`\`

      ### Current Tasks (JSON):
      ${taskData}

      ### Commands (CRITICAL):
      When you need to create or modify a task based on the user's request, you MUST include one of these commands at the end of your response:
      - [TASK_OP:CREATE:{"title": "...", "category": "...", "scheduledAt": timestamp, ...}]
      - [TASK_OP:UPDATE:{"id": "...", "status": "completed", ...}]
      - [TASK_OP:DELETE:{"id": "..."}]

      ### Guidelines for Listing Information:
      When the user asks to list tasks, do NOT output the raw JSON. You must format the list beautifully for a chat interface:
      - Use emojis for status and priority (e.g., 🔴 High, 🟢 Low, ✅ Done, 📅 Date).
      - Group tasks logically (e.g., "Para Hoy", "Esta Semana", "Pendientes").
      - Highlight the task title in bold.
      - Do **NOT** show the Task ID in the output unless explicitly asked.
      - Be concise but informative.

      ### Guidelines for Task Operations:
      1. Use the current date (${dateStr}) to calculate timestamps for "tomorrow", etc. Ensure the year is 2026.
      2. Be precise with categories and projects if the user mentions them.
      3. **MANDATORY**: For [TASK_OP:UPDATE] and [TASK_OP:DELETE], you MUST provide the exact "id" from the JSON list provided above. If you don't provide the ID, the operation will fail.
      4. **ONLY** include fields that exist in the Task interface. Do **NOT** include "dateStr" or other extra fields in the [TASK_OP] command.

      ## Note Management System:
      You can also create, update, or delete notes for the user.
      
      ### Note Interface:
      \`\`\`typescript
      interface Note {
        id: string;
        title: string;
        content: string;
        tagColor: string; // "red", "amber", "emerald", "blue", "purple"
      }
      \`\`\`

      ### Current Notes (JSON):
      ${noteData}

      ### Note Commands:
      When you need to perform actions on notes, use these commands:
      - [NOTE_OP:CREATE:{"title": "...", "content": "...", "tagColor": "..."}]
      - [NOTE_OP:UPDATE:{"id": "...", "content": "...", ...}]
      - [NOTE_OP:DELETE:{"id": "..."}]

      ### Note Guidelines:
      - When listing notes, format them clearly with emojis.
      - Use ** [NOTE_OP:UPDATE] ** or ** [NOTE_OP:DELETE] ** only with a valid "id" from the JSON list.
    `;

    let systemInstructions = `${identityText}\n\n${dateInstruction}\n\n${contextPlataforma}\n\n${taskSystemContext}\n\n${formatResponse}`;

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
        stop_sequences: ["\n\nHuman:", "\n\nUser:", "H:", "User:"],
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
      let aiResponse = resBody.content[0].text;

      // 8. Parse and Execute Memory Commands [MEMORY:TYPE:CONTENT]
      const memoryRegex = /\[MEMORY:(TASK|NOTE|REMINDER):(.+?)\]/i;
      const memoryMatch = aiResponse.match(memoryRegex);

      if (memoryMatch) {
        const type = memoryMatch[1].toLowerCase();
        const content = memoryMatch[2].trim();

        let memoryType: any = 'general';
        if (type === 'task') memoryType = 'tasks';
        if (type === 'note') memoryType = 'notes';
        if (type === 'reminder') memoryType = 'reminders';

        await this.dynamicMemory.saveMemory(userId, memoryType, content);
        aiResponse = aiResponse.replace(memoryRegex, '').trim();
      }

      // 9. Parse and Execute Task Operations [TASK_OP:ACTION:JSON_DATA]
      // Using 'gis' flags to allow global matching across multiple lines
      const taskOpRegex = /\[TASK_OP:(CREATE|UPDATE|DELETE):({.+?})\]/gis;
      const taskOpMatches = [...aiResponse.matchAll(taskOpRegex)];

      for (const match of taskOpMatches) {
        const action = match[1].toUpperCase();
        console.log(`[AI] Task Operation detected: ${action}`);
        try {
          const jsonData = JSON.parse(match[2]);
          console.log(`[AI] Operation Data:`, jsonData);

          if (action === 'CREATE') {
            const filteredData = this.filterTaskData(jsonData, 'CREATE');
            await this.tasksService.create(userId, filteredData as any);
          } else if (action === 'UPDATE') {
            const filteredData = this.filterTaskData(jsonData, 'UPDATE');
            if (filteredData.id) {
              const { id, ...updates } = filteredData as any;
              await this.tasksService.update(userId, id, updates);
            } else {
              console.warn('[AI] UPDATE operation missing required ID field');
            }
          } else if (action === 'DELETE') {
            if (jsonData.id) {
              await this.tasksService.remove(userId, jsonData.id);
            } else {
              console.warn('[AI] DELETE operation missing required ID field');
            }
          }
        } catch (opError) {
          console.error(`Failed to execute task op ${action}:`, opError);
        }
      }

      // 10. Parse and Execute Note Operations [NOTE_OP:ACTION:JSON_DATA]
      const noteOpRegex = /\[NOTE_OP:(CREATE|UPDATE|DELETE):({.+?})\]/gis;
      const noteOpMatches = [...aiResponse.matchAll(noteOpRegex)];

      for (const match of noteOpMatches) {
        const action = match[1].toUpperCase();
        console.log(`[AI] Note Operation detected: ${action}`);
        try {
          const jsonData = JSON.parse(match[2]);
          if (action === 'CREATE') {
            await this.notesService.create(userId, jsonData);
          } else if (action === 'UPDATE') {
            if (jsonData.id) {
              const { id, ...updates } = jsonData;
              await this.notesService.update(userId, id, updates);
            }
          } else if (action === 'DELETE') {
            if (jsonData.id) {
              await this.notesService.remove(userId, jsonData.id);
            }
          }
        } catch (opError) {
          console.error(`Failed to execute note op ${action}:`, opError);
        }
      }

      // Clean ALL commands from the response
      aiResponse = aiResponse.replace(taskOpRegex, '').trim();
      aiResponse = aiResponse.replace(noteOpRegex, '').trim();

      // 10. Save to conversation history (cleaned response)
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

  private filterTaskData(data: any, op: 'CREATE' | 'UPDATE'): any {
    const validFields = [
      'title',
      'project',
      'description',
      'category',
      'status',
      'priority',
      'duration',
      'tagColor',
      'scheduledAt',
      'startedAt',
      'completedAt',
    ];

    if (op === 'UPDATE') {
      validFields.push('id');
    }

    const filtered: any = {};
    for (const key of validFields) {
      if (data[key] !== undefined) {
        filtered[key] = data[key];
      }
    }
    return filtered;
  }
}
