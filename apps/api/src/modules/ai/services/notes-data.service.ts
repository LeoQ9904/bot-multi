import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service to handle note data retrieval and formatting for AI context.
 */
@Injectable()
export class NotesDataService {
    private readonly storageBaseDir = path.join(process.cwd(), 'storage', 'users');

    /**
     * Reads the user's notes.json and returns a formatted string for AI context.
     */
    async getFormattedNotes(userId: string): Promise<string> {
        const filePath = path.join(this.storageBaseDir, userId, 'notes.json');

        if (!fs.existsSync(filePath)) {
            return 'No hay notas registradas aún.';
        }

        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const notes = JSON.parse(data);

            if (!Array.isArray(notes) || notes.length === 0) {
                return 'No hay notas registradas aún.';
            }

            const relevantNotes = notes.map(note => ({
                id: note.id,
                title: note.title,
                content: note.content,
                tagColor: note.tagColor,
                createdAt: note.createdAt
            }));

            return JSON.stringify(relevantNotes, null, 2);
        } catch (error) {
            console.error('Error reading notes data for AI:', error);
            return 'Error al recuperar las notas.';
        }
    }
}
