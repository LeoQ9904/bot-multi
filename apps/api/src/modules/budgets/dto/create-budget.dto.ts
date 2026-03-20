import { IsString, IsNumber, IsInt, Min, Max } from 'class-validator';

export class CreateBudgetDto {
    @IsString()
    categoryId: string;

    @IsNumber()
    limitAmount: number;

    @IsInt()
    @Min(1)
    @Max(12)
    month: number;

    @IsInt()
    @Min(2000)
    year: number;
}
