import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
    BedrockRuntimeClient,
    InvokeModelCommand,
    InvokeModelCommandInput
} from '@aws-sdk/client-bedrock-runtime';
import { MarkdownMemoryService } from '../memory/markdown-memory.service';
import { InMemCacheService } from '../memory/in-mem-cache.service';
import { DynamicMemoryService, MemoryType } from '../memory/dynamic-memory.service';
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
        const dateTimeQueries = ['qué día', 'que dia', 'qué hora', 'que hora', 'what day', 'what time', 'today is', 'hoy es'];
        if (dateTimeQueries.some(q => lowerPrompt.includes(q))) {
            return false;
        }

        // Only search if the query explicitly asks for current/live data
        const searchTriggers = [
            'precio actual', 'current price', 'precio de', 'price of',
            'últimas noticias', 'latest news', 'noticias de hoy', 'news today',
            'clima actual', 'current weather', 'temperatura en', 'temperature in',
            'cotización', 'exchange rate', 'tasa de cambio',
            'resultados de', 'results of', 'marcador', 'score',
            'qué pasó hoy', 'what happened today', 'eventos de hoy'
        ];

        return searchTriggers.some(trigger => lowerPrompt.includes(trigger));
    }

    async generateResponse(userId: string, conversationId: string, prompt: string): Promise<string> {
        // 1. Get bot identity
        const identity = await this.identityService.getIdentity(userId);

        // 2. Get recent context from cache
        const recentContext = this.inMemCache.getRecentContext(conversationId);

        // 3. Check if user wants to save memory
        const shouldSave = this.dynamicMemory.shouldSaveMemory(prompt);
        const memoryType = this.dynamicMemory.detectMemoryType(prompt);

        // 4. Load relevant memories
        let memoriesContext = '';
        if (memoryType) {
            const memories = await this.dynamicMemory.getMemory(userId, memoryType);
            if (memories) {
                memoriesContext = `\n\nYour ${memoryType}:\n${memories}`;
            }
        }

        // 5. Perform web search if needed
        let searchResults = '';
        if (this.shouldSearch(prompt)) {
            searchResults = await this.searchService.search(prompt);
        }

        // 6. Prepare full prompt with identity, date, search results, and context
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        let systemInstructions = `You are ${identity.name}. ${identity.personality}\nToday is ${dateStr}.`;

        // Add memory management instructions
        if (shouldSave) {
            systemInstructions += `\n\nIMPORTANT: The user wants to save information. Extract the key information they want to remember and format it clearly. Confirm what you've saved.`;
        }

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
            await this.markdownMemory.saveMessage(userId, conversationId, 'user', prompt);
            await this.markdownMemory.saveMessage(userId, conversationId, 'assistant', aiResponse);

            this.inMemCache.addToCache(conversationId, 'user', prompt);
            this.inMemCache.addToCache(conversationId, 'assistant', aiResponse);

            // 8. Save to dynamic memory if needed
            if (shouldSave && memoryType) {
                await this.dynamicMemory.saveMemory(userId, memoryType, `${prompt}\n\nResponse: ${aiResponse}`);
            }

            return aiResponse;
        } catch (error) {
            console.error('AWS Bedrock error:', error);
            throw new InternalServerErrorException('Failed to generate AI response');
        }
    }
}
