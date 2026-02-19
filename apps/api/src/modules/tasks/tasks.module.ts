import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from '../../prisma.service';

import { SchedulerModule } from '../scheduler/scheduler.module';

@Module({
    imports: [SchedulerModule],
    controllers: [TasksController],
    providers: [TasksService, PrismaService],
    exports: [TasksService],
})
export class TasksModule { }
