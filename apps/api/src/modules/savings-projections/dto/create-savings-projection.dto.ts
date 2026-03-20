import { IsString, IsNumber, IsInt, Min, Max, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateProjectionDetailDto {
    @IsString()
    categoryId: string;

    @IsNumber()
    projectedAmount: number;

    @IsString()
    type: 'GASTO' | 'INGRESO';
}

export class CreateSavingsProjectionDto {
    @IsString()
    name: string;

    @IsNumber()
    totalProjectedIncomes: number;

    @IsNumber()
    totalProjectedExpenses: number;

    @IsNumber()
    estimatedSavings: number;

    @IsInt()
    @Min(1)
    @Max(12)
    startMonth: number;

    @IsInt()
    startYear: number;

    @IsInt()
    @Min(1)
    @Max(12)
    endMonth: number;

    @IsInt()
    endYear: number;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProjectionDetailDto)
    details: CreateProjectionDetailDto[];
}
