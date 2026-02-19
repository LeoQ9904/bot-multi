import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaService } from '../../prisma.service';

@Module({
    imports: [NotificationsModule],
    providers: [SchedulerService, PrismaService],
    exports: [SchedulerService],
})
export class SchedulerModule { }
