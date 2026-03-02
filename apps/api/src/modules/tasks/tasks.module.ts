import { Module, forwardRef } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from '../../prisma.service';

import { SchedulerModule } from '../scheduler/scheduler.module';
import { AIModule } from '../ai/ai.module';

@Module({
    imports: [SchedulerModule, forwardRef(() => AIModule)],
    controllers: [TasksController],
    providers: [TasksService, PrismaService],
    exports: [TasksService],
})
export class TasksModule { }
