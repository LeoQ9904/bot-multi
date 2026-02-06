import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export enum MemoryType {
    TASK = 'tasks',
    NOTE = 'notes',
    REMINDER = 'reminders',
    GENERAL = 'general'
}

@Injectable()
export class DynamicMemoryService {
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

    async saveMemory(userId: string, type: MemoryType, content: string): Promise<void> {
        const filePath = path.join(this.storagePath, `${userId}_${type}.md`);
        const timestamp = new Date().toISOString();
        
        let entry = '';
        switch (type) {
            case MemoryType.TASK:
                entry = `- [ ] ${content} _(${timestamp})_\n`;
                break;
            case MemoryType.REMINDER:
                entry = `- 🔔 ${content} _(${timestamp})_\n`;
                break;
            case MemoryType.NOTE:
                entry = `### ${new Date().toLocaleDateString('es-CO')}\n${content}\n\n`;
                break;
            default:
                entry = `\n## [${timestamp}]\n${content}\n\n---\n`;
        }

        try {
            await fs.appendFile(filePath, entry, 'utf8');
        } catch (error) {
            console.error('Error saving memory:', error);
        }
    }

    async getMemory(userId: string, type: MemoryType): Promise<string> {
        const filePath = path.join(this.storagePath, `${userId}_${type}.md`);
        try {
            return await fs.readFile(filePath, 'utf8');
        } catch (error) {
            return '';
        }
    }

    async updateTask(userId: string, taskIndex: number, completed: boolean): Promise<void> {
        const filePath = path.join(this.storagePath, `${userId}_${MemoryType.TASK}.md`);
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');
            let taskCount = 0;
            
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('- [')) {
                    if (taskCount === taskIndex) {
                        lines[i] = lines[i].replace(/- \[([ x])\]/, `- [${completed ? 'x' : ' '}]`);
                        break;
                    }
                    taskCount++;
                }
            }
            
            await fs.writeFile(filePath, lines.join('\n'), 'utf8');
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }
        let allMemories = '';
        for (const type of Object.values(MemoryType)) {
            const memory = await this.getMemory(userId, type as MemoryType);
            if (memory) {
                allMemories += `\n# ${type.toUpperCase()}\n${memory}\n`;
            }
        }
        return allMemories;
    }

    detectMemoryAction(prompt: string): { action: 'list' | 'add' | 'complete' | null, type: MemoryType | null } {
        const lower = prompt.toLowerCase();
        
        // Detect list action
        const listKeywords = ['listar', 'list', 'mostrar', 'show', 'ver', 'cuáles', 'qué tengo', 'mis'];
        const isListAction = listKeywords.some(k => lower.includes(k));
        
        // Detect complete action
        const completeKeywords = ['completar', 'complete', 'marcar', 'hecho', 'done', 'terminé', 'finished'];
        const isCompleteAction = completeKeywords.some(k => lower.includes(k));
        
        const type = this.detectMemoryType(prompt);
        
        if (isListAction && type) return { action: 'list', type };
        if (isCompleteAction && type === MemoryType.TASK) return { action: 'complete', type };
        if (this.shouldSaveMemory(prompt) && type) return { action: 'add', type };
        
        return { action: null, type: null };
    }

    async getAllMemories(userId: string): Promise<string> {
        const lower = prompt.toLowerCase();
        
        const taskKeywords = ['tarea', 'task', 'hacer', 'to do', 'pendiente', 'pending'];
        const noteKeywords = ['nota', 'note', 'apunte', 'anotar', 'escribir'];
        const reminderKeywords = ['recordar', 'reminder', 'recordatorio', 'no olvidar', 'remember'];

        if (taskKeywords.some(k => lower.includes(k))) return MemoryType.TASK;
        if (reminderKeywords.some(k => lower.includes(k))) return MemoryType.REMINDER;
        if (noteKeywords.some(k => lower.includes(k))) return MemoryType.NOTE;

        return null;
    }

    shouldSaveMemory(prompt: string): boolean {
        const lower = prompt.toLowerCase();
        const triggers = [
            'guardar', 'save', 'recordar', 'remember', 'anotar', 'note',
            'agregar tarea', 'add task', 'crear tarea', 'create task',
            'no olvidar', 'don\'t forget', 'apuntar', 'write down'
        ];
        return triggers.some(t => lower.includes(t));
    }
}
