import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MarkdownMemoryService {
  private readonly storagePath = path.join(process.cwd(), 'storage/memory');

  constructor() {
    this.ensureStorageExists();
  }

  private async ensureStorageExists() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (error) {
      console.error('Error creating memory storage directory:', error);
    }
  }

  async saveMessage(
    userId: string,
    conversationId: string,
    role: string,
    content: string,
  ) {
    const filePath = path.join(
      this.storagePath,
      `${userId}_${conversationId}.md`,
    );
    const timestamp = new Date().toISOString();
    const entry = `\n### [${timestamp}] ${role.toUpperCase()}\n${content}\n---\n`;

    try {
      await fs.appendFile(filePath, entry, 'utf8');
    } catch (error) {
      console.error('Error saving message to markdown:', error);
    }
  }

  async getConversationHistory(
    userId: string,
    conversationId: string,
  ): Promise<string> {
    const filePath = path.join(
      this.storagePath,
      `${userId}_${conversationId}.md`,
    );
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      return ''; // Return empty if file doesn't exist yet
    }
  }
}
