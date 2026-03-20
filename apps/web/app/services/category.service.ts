import { useApi } from './api.service';
import type { Category } from '../types/category.types';

export const useCategoryService = () => {
    const api = useApi();
    return {
        findAll: () => api.get<Category[]>('/categories'),
        findOne: (id: string) => api.get<Category>(`/categories/${id}`),
        create: (category: Partial<Category>) => api.post<Category>('/categories', category),
        update: (id: string, category: Partial<Category>) => api.patch<Category>(`/categories/${id}`, category),
        delete: (id: string) => api.delete(`/categories/${id}`),
    };
};
