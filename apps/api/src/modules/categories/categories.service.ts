import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.category.findFirst({
      where: { id, userId },
    });
  }

  async update(userId: string, id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id, userId },
      data: updateCategoryDto,
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.category.delete({
      where: { id, userId },
    });
  }
}
