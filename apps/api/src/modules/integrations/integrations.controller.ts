import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Req,
    Logger,
} from '@nestjs/common';
import { IntegrationsService } from './services/integrations.service';
import { TelegramService } from './services/telegram.service';
import { FirebaseGuard } from '../../common/guards/firebase.guard';

@Controller('integrations')
@UseGuards(FirebaseGuard)
export class IntegrationsController {
    private readonly logger = new Logger(IntegrationsController.name);

    constructor(
        private readonly integrationsService: IntegrationsService,
        private readonly telegramService: TelegramService,
    ) { }

    @Post()
    async save(
        @Req() req: any,
        @Body() body: { type: string; config: any; name?: string },
    ) {
        const result = await this.integrationsService.createOrUpdate(
            req.user.id,
            body.type,
            body.config,
            body.name,
        );

        if (body.type === 'TELEGRAM' && body.config.token) {
            try {
                await this.telegramService.startBot(req.user.id, body.config.token);
            } catch (error) {
                console.error('Failed to start Telegram bot:', error);
                // We return the result but warn that the bot couldn't start
                return {
                    ...result,
                    warning:
                        'Integration saved but bot failed to start. Check your token.',
                };
            }
        }

        return result;
    }

    @Get()
    async findAll(@Req() req: any) {
        return this.integrationsService.findAll(req.user.id);
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string) {
        return this.integrationsService.findOne(id, req.user.id);
    }

    @Delete(':id')
    async remove(@Req() req: any, @Param('id') id: string) {
        const userId = req.user.id;
        const integration = await this.integrationsService.findOne(id, userId);

        if (integration.type === 'TELEGRAM') {
            this.logger.log(
                `Stopping Telegram bot for user ${userId} before removal`,
            );
            this.telegramService.stopBot(userId);
        }

        return this.integrationsService.remove(id, userId);
    }
}
