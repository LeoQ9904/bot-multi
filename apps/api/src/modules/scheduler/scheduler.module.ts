import { Module, forwardRef } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaService } from '../../prisma.service';
import { TasksModule } from '../tasks/tasks.module';

@Module({
    imports: [NotificationsModule, forwardRef(() => TasksModule)],
    providers: [SchedulerService, PrismaService],
    exports: [SchedulerService],
})
export class SchedulerModule { }
