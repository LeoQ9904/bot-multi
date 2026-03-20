import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSavingsProjectionDto } from './dto/create-savings-projection.dto';
import { UpdateSavingsProjectionDto } from './dto/update-savings-projection.dto';

@Injectable()
export class SavingsProjectionsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, createSavingsProjectionDto: CreateSavingsProjectionDto) {
    const { details, ...projectionData } = createSavingsProjectionDto;
    return this.prisma.savingsProjection.create({
      data: {
        ...projectionData,
        userId,
        details: {
          create: details,
        },
      },
      include: { details: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.savingsProjection.findMany({
      where: { userId },
      include: { details: { include: { category: true } } },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.savingsProjection.findFirst({
      where: { id, userId },
      include: { details: { include: { category: true } } },
    });
  }

  async update(userId: string, id: string, updateSavingsProjectionDto: UpdateSavingsProjectionDto) {
    const { details, ...projectionData } = updateSavingsProjectionDto;

    // Simplistic update: delete old details and create new ones if provided
    if (details) {
      await this.prisma.projectionDetail.deleteMany({
        where: { projectionId: id },
      });
    }

    return this.prisma.savingsProjection.update({
      where: { id, userId },
      data: {
        ...projectionData,
        details: details ? {
          create: details,
        } : undefined,
      },
      include: { details: true },
    });
  }

  async remove(userId: string, id: string) {
    // Details will be deleted by cascade if configured, or manually
    await this.prisma.projectionDetail.deleteMany({
      where: { projectionId: id },
    });
    return this.prisma.savingsProjection.delete({
      where: { id, userId },
    });
  }
}
