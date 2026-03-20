import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomesService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, createIncomeDto: CreateIncomeDto) {
    return this.prisma.income.create({
      data: {
        ...createIncomeDto,
        userId,
        date: new Date(createIncomeDto.date),
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.income.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.income.findFirst({
      where: { id, userId },
      include: { category: true },
    });
  }

  async update(userId: string, id: string, updateIncomeDto: UpdateIncomeDto) {
    return this.prisma.income.update({
      where: { id, userId },
      data: {
        ...updateIncomeDto,
        date: updateIncomeDto.date ? new Date(updateIncomeDto.date) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.income.delete({
      where: { id, userId },
    });
  }
}
