import type { Category } from './category.types';

export enum Frequency {
    UNICO = 'UNICO',
    MENSUAL = 'MENSUAL',
    QUINCENAL = 'QUINCENAL',
    SEMANAL = 'SEMANAL',
    ANUAL = 'ANUAL',
}

export interface Income {
    id: string;
    userId: string;
    categoryId: string;
    category?: Category;
    description: string;
    amount: number;
    source?: string;
    frequency: Frequency;
    date: string;
    isRecurrent: boolean;
    createdAt: string;
    updatedAt: string;
}
