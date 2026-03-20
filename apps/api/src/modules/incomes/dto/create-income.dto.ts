import { IsString, IsNumber, IsEnum, IsBoolean, IsDateString, IsOptional } from 'class-validator';

enum Frequency {
    UNICO = 'UNICO',
    MENSUAL = 'MENSUAL',
    QUINCENAL = 'QUINCENAL',
    SEMANAL = 'SEMANAL',
    ANUAL = 'ANUAL',
}

export class CreateIncomeDto {
    @IsString()
    categoryId: string;

    @IsString()
    description: string;

    @IsNumber()
    amount: number;

    @IsString()
    @IsOptional()
    source?: string;

    @IsEnum(Frequency)
    @IsOptional()
    frequency?: Frequency;

    @IsDateString()
    date: string;

    @IsBoolean()
    @IsOptional()
    isRecurrent?: boolean;
}
