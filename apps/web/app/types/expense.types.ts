import type { Category } from './category.types';
import { Frequency } from './income.types';

export interface Expense {
    id: string;
    userId: string;
    categoryId: string;
    category?: Category;
    description: string;
    amount: number;
    frequency: Frequency;
    date: string;
    isRecurrent: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
