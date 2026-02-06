import { Module } from '@nestjs/common';
import { IntegrationsService } from './services/integrations.service';
import { TelegramService } from './services/telegram.service';
import { IntegrationsController } from './integrations.controller';
import { PrismaService } from '../../prisma.service';
import { AIModule } from '../ai/ai.module';

@Module({
    imports: [AIModule],
    providers: [IntegrationsService, TelegramService, PrismaService],
    controllers: [IntegrationsController],
    exports: [IntegrationsService],
})
export class IntegrationsModule { }
