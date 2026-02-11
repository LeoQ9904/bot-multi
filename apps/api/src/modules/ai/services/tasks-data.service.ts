import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service to handle task data retrieval and formatting for AI context.
 */
@Injectable()
export class TasksDataService {
    private readonly storageBaseDir = path.join(process.cwd(), 'storage', 'users');

    /**
     * Reads the user's tasks.json and returns a formatted string for AI context.
     */
    async getFormattedTasks(userId: string): Promise<string> {
        const filePath = path.join(this.storageBaseDir, userId, 'tasks.json');

        if (!fs.existsSync(filePath)) {
            return 'No hay tareas registradas aún.';
        }

        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const tasks = JSON.parse(data);

            if (!Array.isArray(tasks) || tasks.length === 0) {
                return 'No hay tareas registradas aún.';
            }

            // Filter tasks (e.g., pending or recently completed)
            // We return the raw JSON string so the AI can format it as needed
            const relevantTasks = tasks.map(task => ({
                id: task.id,
                title: task.title,
                project: task.project,
                category: task.category,
                status: task.status,
                priority: task.priority,
                scheduledAt: task.scheduledAt,
                // Add human readable date for context, but keep timestamp
                dateStr: new Date(task.scheduledAt).toLocaleDateString('es-CO')
            }));

            return JSON.stringify(relevantTasks, null, 2);
        } catch (error) {
            console.error('Error reading tasks data for AI:', error);
            return 'Error al recuperar las tareas.';
        }
    }
}
