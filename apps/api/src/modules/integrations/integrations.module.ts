import { Module } from '@nestjs/common';
import { IntegrationsService } from './services/integrations.service';
import { TelegramService } from './services/telegram.service';
import { IntegrationsController } from './integrations.controller';
import { PrismaService } from '../../prisma.service';
import { AIModule } from '../ai/ai.module';
import { SchedulerModule } from '../scheduler/scheduler.module';

@Module({
    imports: [AIModule, SchedulerModule],
    controllers: [IntegrationsController],
    providers: [IntegrationsService, TelegramService, PrismaService],
    exports: [IntegrationsService, TelegramService],
})
export class IntegrationsModule { }
