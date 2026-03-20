export enum TransactionType {
    GASTO = 'GASTO',
    INGRESO = 'INGRESO',
}

export interface Category {
    id: string;
    userId: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    type: TransactionType;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
