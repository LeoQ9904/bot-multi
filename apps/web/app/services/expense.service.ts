import { useApi } from './api.service';
import type { Expense } from '../types/expense.types';

export const useExpenseService = () => {
    const api = useApi();

    return {
        findAll: () => api.get<Expense[]>('/expenses'),
        findOne: (id: string) => api.get<Expense>(`/expenses/${id}`),
        create: (expense: Partial<Expense>) => api.post<Expense>('/expenses', expense),
        update: (id: string, expense: Partial<Expense>) => api.patch<Expense>(`/expenses/${id}`, expense),
        delete: (id: string) => api.delete(`/expenses/${id}`),
    };
};
