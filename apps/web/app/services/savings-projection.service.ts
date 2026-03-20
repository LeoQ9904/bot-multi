import { useApi } from './api.service';
import type { SavingsProjection } from '../types/savings-projection.types';

export const useSavingsProjectionService = () => {
    const api = useApi();

    return {
        findAll: () => api.get<SavingsProjection[]>('/savings-projections'),
        findOne: (id: string) => api.get<SavingsProjection>(`/savings-projections/${id}`),
        create: (projection: Partial<SavingsProjection>) => api.post<SavingsProjection>('/savings-projections', projection),
        update: (id: string, projection: Partial<SavingsProjection>) => api.patch<SavingsProjection>(`/savings-projections/${id}`, projection),
        delete: (id: string) => api.delete(`/savings-projections/${id}`),
    };
};
