import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemCacheService {
    private cache = new Map<string, string[]>();
    private readonly MAX_MESSAGES = 10;

    addToCache(conversationId: string, role: string, content: string) {
        const history = this.cache.get(conversationId) || [];
        history.push(`${role}: ${content}`);

        // Keep only the latest N messages for fast context
        if (history.length > this.MAX_MESSAGES) {
            history.shift();
        }

        this.cache.set(conversationId, history);
    }

    getRecentContext(conversationId: string): string {
        return (this.cache.get(conversationId) || []).join('\n');
    }

    clearConversation(conversationId: string) {
        this.cache.delete(conversationId);
    }
}
