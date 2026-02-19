import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Telegraf } from 'telegraf';
import { IntegrationsService } from '../services/integrations.service';
import { AIService } from '../../ai/services/ai.service';
import { IdentityService } from '../../ai/services/identity.service';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(TelegramService.name);
    private bots: Map<string, Telegraf> = new Map();
    private launchingUserIds: Set<string> = new Set();

    constructor(
        private readonly integrationsService: IntegrationsService,
        private readonly aiService: AIService,
        private readonly identityService: IdentityService,
    ) { }

    async onModuleInit() {
        this.logger.log('Initializing existing Telegram integrations (background)...');
        // Do not await the initialization loop to avoid blocking application startup
        this.initializeBots();
    }

    async onModuleDestroy() {
        this.logger.log('Shutting down all Telegram bots...');
        for (const [userId, bot] of this.bots.entries()) {
            try {
                this.logger.log(`Stopping bot for user ${userId}`);
                bot.stop('SIGTERM');
            } catch (error) {
                this.logger.error(`Error stopping bot for user ${userId}:`, error);
            }
        }
        this.bots.clear();
    }

    private async initializeBots() {
        try {
            const integrations = await this.integrationsService.findAllByPlatform('TELEGRAM');
            this.logger.log(`Found ${integrations.length} Telegram integrations to initialize.`);
            for (const integration of integrations) {
                const config = integration.config as { token: string };
                if (config.token && integration.isActive) {
                    this.startBot(integration.userId, config.token).catch(err => {
                        this.logger.error(`Failed to start bot for user ${integration.userId} during init:`, err);
                    });
                } else {
                    this.logger.warn(`Skipping integration for user ${integration.userId}: No token or inactive.`);
                }
            }
        } catch (error) {
            this.logger.error('Error during global bot initialization:', error);
        }
    }

    async startBot(userId: string, token: string) {
        this.logger.log(`Starting bot for user ${userId} with token ending in ...${token.slice(-5)}`);
        if (this.launchingUserIds.has(userId)) {
            this.logger.warn(`Bot launch already in progress for user ${userId}. Skipping.`);
            return;
        }

        this.launchingUserIds.add(userId);

        try {
            if (this.bots.has(userId)) {
                this.logger.log(`Stopping existing bot instance for user ${userId}`);
                const existingBot = this.bots.get(userId);
                if (existingBot) {
                    existingBot.stop('SIGTERM');
                    // Small delay to ensure Telegram process is closed
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                this.bots.delete(userId);
            }

            const bot = new Telegraf(token);

            bot.start(async (ctx) => {
                console.log('ctx.chat.id', ctx.chat.id);
                const identity = await this.identityService.getIdentity(userId);
                this.integrationsService.updateIdTelegram(ctx.chat.id, userId);
                await ctx.reply(identity.greeting);
            });

            bot.on('text', async (ctx) => {
                const prompt = ctx.message.text;
                const conversationId = 'main';

                try {
                    const aiResponse = await this.aiService.generateResponse(userId, conversationId, prompt, 'telegram');
                    await ctx.reply(aiResponse.response);
                } catch (error) {
                    this.logger.error(`AI Error for user ${userId}:`, error);
                    await ctx.reply('Sorry, I encountered an error processing your request.');
                }
            });

            // Start the bot and wait for it to be ready
            this.logger.log(`Launching bot for user ${userId}...`);

            // Register bot immediately so it's available
            this.bots.set(userId, bot);
            this.logger.log(`Bot instance registered for user ${userId}. Map size: ${this.bots.size}`);

            // Launch bot without awaiting to avoid blocking the request
            // Telegraf's launch() promise resolves when the bot stops, or if it fails to start? 
            // Actually launch() resolves when started? No, it keeps running.
            // We'll treat it as a background process.
            bot.launch().then(() => {
                this.logger.log(`Bot for user ${userId} has stopped.`);
            }).catch(err => {
                this.logger.error(`Failed to launch bot for user ${userId}:`, err);
                this.bots.delete(userId);
            });

            return;
        } catch (error) {
            // Handle specific Telegram conflict errors
            if (error.message?.includes('409: Conflict')) {
                this.logger.error(`Telegram Conflict (409) for user ${userId}. Another instance might be running. Trace: ${error.message}`);
            } else {
                this.logger.error(`Failed to start bot for user ${userId}: ${error.message}`);
            }
        } finally {
            this.launchingUserIds.delete(userId);
        }
    }

    stopBot(userId: string) {
        const bot = this.bots.get(userId);
        if (bot) {
            this.logger.log(`Manually stopping bot for user ${userId}`);
            bot.stop('SIGTERM');
            this.bots.delete(userId);
        }
    }

    async sendMessage(userId: string, chatId: number, message: string) {
        const bot = this.bots.get(userId);
        if (bot) {
            await bot.telegram.sendMessage(chatId, message);
        } else {
            this.logger.warn(`No active bot found for user ${userId} to send message. Available bots: ${JSON.stringify(Array.from(this.bots.keys()))}`);
        }
    }

    @OnEvent('notification.send')
    async handleNotification(payload: { userId: string, channel: string, message: string }) {
        this.logger.log(`Handling notification for user ${payload.userId} on channel ${payload.channel}`);
        if (payload.channel === 'TELEGRAM') {
            try {
                const integration = await this.integrationsService.findOneByUserIdAndType(payload.userId, 'TELEGRAM');
                const config = integration?.config as any;

                if (config?.idTelegram) {
                    await this.sendMessage(payload.userId, config.idTelegram, payload.message);
                } else {
                    this.logger.warn(`No Telegram Chat ID found for user ${payload.userId}. User must interact with bot first.`);
                }
            } catch (error) {
                this.logger.error(`Failed to handle notification for user ${payload.userId}:`, error);
            }
        }
    }
}
