import { Module } from '@nestjs/common';
import { SavingsProjectionsService } from './savings-projections.service';
import { SavingsProjectionsController } from './savings-projections.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [SavingsProjectionsController],
  providers: [SavingsProjectionsService, PrismaService],
  exports: [SavingsProjectionsService],
})
export class SavingsProjectionsModule { }
