import type { Category, TransactionType } from './category.types';

export interface ProjectionDetail {
    id: string;
    projectionId: string;
    categoryId: string;
    category?: Category;
    projectedAmount: number;
    type: TransactionType;
}

export interface SavingsProjection {
    id: string;
    userId: string;
    name: string;
    totalProjectedIncomes: number;
    totalProjectedExpenses: number;
    estimatedSavings: number;
    startMonth: number;
    startYear: number;
    endMonth: number;
    endYear: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    details: ProjectionDetail[];
}
