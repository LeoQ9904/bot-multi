import { useApi } from './api.service';
import type { Income } from '../types/income.types';

export const useIncomeService = () => {
    const api = useApi();

    return {
        findAll: () => api.get<Income[]>('/incomes'),
        findOne: (id: string) => api.get<Income>(`/incomes/${id}`),
        create: (income: Partial<Income>) => api.post<Income>('/incomes', income),
        update: (id: string, income: Partial<Income>) => api.patch<Income>(`/incomes/${id}`, income),
        delete: (id: string) => api.delete(`/incomes/${id}`),
    };
};
