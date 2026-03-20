import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, createBudgetDto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        ...createBudgetDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });
  }

  async update(userId: string, id: string, updateBudgetDto: UpdateBudgetDto) {
    return this.prisma.budget.update({
      where: { id, userId },
      data: updateBudgetDto,
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.budget.delete({
      where: { id, userId },
    });
  }
}
