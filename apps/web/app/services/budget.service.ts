import { useApi } from './api.service';
import type { Budget } from '../types/budget.types';

export const useBudgetService = () => {
    const api = useApi();

    return {
        findAll: () => api.get<Budget[]>('/budgets'),
        findOne: (id: string) => api.get<Budget>(`/budgets/${id}`),
        create: (budget: Partial<Budget>) => api.post<Budget>('/budgets', budget),
        update: (id: string, budget: Partial<Budget>) => api.patch<Budget>(`/budgets/${id}`, budget),
        delete: (id: string) => api.delete(`/budgets/${id}`),
    };
};
