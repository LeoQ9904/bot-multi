import { ApiService } from './api.service';
import { IA_ENDPOINTS } from '../constants/api-endpoints';
import type { ChatResponse, BotIdentity, IdentitySaveResponse, Interests, InterestsResponse } from '../interfaces';
import type { Task } from '~/types/task.types';

/**
 * IA Service
 */
export class IaService {
    static async chat(message: string, conversationId: string, token: string) {
        return ApiService.post<ChatResponse>(
            IA_ENDPOINTS.CHAT,
            { prompt: message, conversationId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }

    static async getIdentity(token: string) {
        return ApiService.get<BotIdentity>(IA_ENDPOINTS.IDENTITY, { headers: { Authorization: `Bearer ${token}` } });
    }

    static async updateIdentity(data: BotIdentity, token: string) {
        return ApiService.post<IdentitySaveResponse>(IA_ENDPOINTS.IDENTITY, data, { headers: { Authorization: `Bearer ${token}` } });
    }

    static async getInterests(token: string) {
        return ApiService.get<InterestsResponse>(IA_ENDPOINTS.INTERESTS, { headers: { Authorization: `Bearer ${token}` } });
    }

    static async postTasks(prompt: string, conversationId: string, datetime: string, token: string) {
        return ApiService.post<{ task: Task }>(IA_ENDPOINTS.TASKS, { prompt, conversationId, datetime }, { headers: { Authorization: `Bearer ${token}` } });
    }
}

export const useIaService = () => {
    return {
        chat: IaService.chat,
        getIdentity: IaService.getIdentity,
        updateIdentity: IaService.updateIdentity,
        getInterests: IaService.getInterests,
        postTasks: IaService.postTasks,
    };
};
