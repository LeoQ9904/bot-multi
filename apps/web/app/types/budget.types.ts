import type { Category } from './category.types';

export interface Budget {
    id: string;
    userId: string;
    categoryId: string;
    category?: Category;
    limitAmount: number;
    month: number;
    year: number;
    createdAt: string;
    updatedAt: string;
}
