import { ApiService } from './api.service';
import { TASK_ENDPOINTS } from '../constants/api-endpoints';
import type { Task } from '../types/task.types';

/**
 * Task Service
 */
export class TaskService {
    static async findAll(token: string) {
        return ApiService.get<Task[]>(TASK_ENDPOINTS.LIST, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    static async findOne(id: string, token: string) {
        return ApiService.get<Task>(TASK_ENDPOINTS.BY_ID(id), {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    static async create(task: Omit<Task, 'id' | 'createdAt'>, token: string) {
        return ApiService.post<Task>(TASK_ENDPOINTS.CREATE, task, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    static async update(id: string, task: Partial<Task>, token: string) {
        return ApiService.patch<Task>(TASK_ENDPOINTS.UPDATE(id), task, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    static async delete(id: string, token: string) {
        return ApiService.delete<{ success: boolean }>(TASK_ENDPOINTS.DELETE(id), {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}

export const useTaskService = () => {
    return {
        findAll: TaskService.findAll,
        findOne: TaskService.findOne,
        create: TaskService.create,
        update: TaskService.update,
        delete: TaskService.delete,
    };
};
