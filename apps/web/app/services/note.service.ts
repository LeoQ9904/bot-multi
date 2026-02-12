import { ApiService } from './api.service';
import { NOTE_ENDPOINTS } from '../constants/api-endpoints';
import type { Note } from '../types/note.types';

/**
 * Note Service
 */
export class NoteService {
    static async findAll(token: string) {
        return ApiService.get<Note[]>(NOTE_ENDPOINTS.LIST, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    static async findOne(id: string, token: string) {
        return ApiService.get<Note>(NOTE_ENDPOINTS.BY_ID(id), {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    static async create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, token: string) {
        return ApiService.post<Note>(NOTE_ENDPOINTS.CREATE, note, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    static async update(id: string, note: Partial<Note>, token: string) {
        return ApiService.patch<Note>(NOTE_ENDPOINTS.UPDATE(id), note, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    static async delete(id: string, token: string) {
        return ApiService.delete<{ success: boolean }>(NOTE_ENDPOINTS.DELETE(id), {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}

export const useNoteService = () => {
    return {
        findAll: NoteService.findAll,
        findOne: NoteService.findOne,
        create: NoteService.create,
        update: NoteService.update,
        delete: NoteService.delete,
    };
};
