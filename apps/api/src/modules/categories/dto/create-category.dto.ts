import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

enum TransactionType {
    GASTO = 'GASTO',
    INGRESO = 'INGRESO',
}

export class CreateCategoryDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsEnum(TransactionType)
    type: TransactionType;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
