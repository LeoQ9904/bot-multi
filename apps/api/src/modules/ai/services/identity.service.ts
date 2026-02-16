import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface BotIdentity {
    name: string;
    greeting: string;
    personality: string;
    interests: string;
}

@Injectable()
export class IdentityService {
    private readonly logger = new Logger(IdentityService.name);
    private readonly storagePath = path.join(process.cwd(), 'storage/memory');

    constructor() {
        this.ensureStorageExists();
    }

    private async ensureStorageExists() {
        try {
            await fs.mkdir(this.storagePath, { recursive: true });
        } catch (error) {
            this.logger.error('Error creating identity storage directory:', error);
        }
    }

    private getIdentityPath(userId: string): string {
        return path.join(this.storagePath, `${userId}_identity.json`);
    }

    async getIdentity(userId: string): Promise<BotIdentity> {
        const filePath = this.getIdentityPath(userId);
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            // Default identity if none exists
            return {
                name: 'Lylla Asistent',
                greeting: 'Hola! Soy tu asistente virtual, ¿en qué puedo ayudarte hoy?',
                personality: 'Eres un asistente profesional y conciso, con un tono amable y servicial. Tu objetivo es ayudar al usuario en sus tareas diarias de manera eficiente y precisa.',
                interests: 'Me gusta hablar de tecnologia, programacion, IA, etc.'
            };
        }
    }

    async saveIdentity(userId: string, identity: BotIdentity): Promise<void> {
        const filePath = this.getIdentityPath(userId);
        this.logger.log(`IdentityService: Attempting to save identity to ${filePath}`);
        try {
            await fs.writeFile(filePath, JSON.stringify(identity, null, 2), 'utf8');
            this.logger.log(`IdentityService: Identity saved successfully for user ${userId}`);
        } catch (error) {
            this.logger.error(`IdentityService: Error saving identity for user ${userId}:`, error);
            throw error;
        }
    }
}
