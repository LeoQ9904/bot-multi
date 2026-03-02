import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { SchedulerService } from '../../scheduler/scheduler.service';

@Injectable()
export class IntegrationsService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => SchedulerService))
        private readonly schedulerService: SchedulerService
    ) { }

    async createOrUpdate(userId: string, type: string, config: any, name?: string) {
        console.log(`IntegrationsService: createOrUpdate for user ${userId}, type ${type}`);
        const existing = await this.prisma.integration.findFirst({
            where: { userId, type },
        });

        let result;
        if (existing) {
            console.log(`IntegrationsService: Updating existing integration ${existing.id}`);
            result = await this.prisma.integration.update({
                where: { id: existing.id },
                data: { config, name, isActive: true },
            });
        } else {
            console.log(`IntegrationsService: Creating new integration record...`);
            result = await this.prisma.integration.create({
                data: {
                    userId,
                    type,
                    config,
                    name,
                },
            });
        }

        // Special logic for Daily Plan
        if (type === 'DAILY_PLAN') {
            await this.schedulerService.scheduleMonthlyDailyPlans(userId);
        }

        return result;
    }

    async findAll(userId: string) {
        return this.prisma.integration.findMany({
            where: { userId },
        });
    }

    async findAllByPlatform(type: string) {
        return this.prisma.integration.findMany({
            where: { type, isActive: true },
        });
    }

    async findOne(id: string, userId: string) {
        const integration = await this.prisma.integration.findFirst({
            where: { id, userId },
        });
        if (!integration) throw new NotFoundException('Integration not found');
        return integration;
    }

    async findOneByUserIdAndType(userId: string, type: string) {
        return this.prisma.integration.findFirst({
            where: { userId, type },
        });
    }

    async remove(id: string, userId: string) {
        const integration = await this.findOne(id, userId);

        if (integration.type === 'DAILY_PLAN') {
            await this.schedulerService.cancelFutureDailyPlans(userId);
        }

        return this.prisma.integration.delete({
            where: { id },
        });
    }

    async updateIdTelegram(idTelegram: number, userId: string, type: string = 'TELEGRAM') {
        const integration = await this.prisma.integration.findFirst({
            where: { userId, type },
        });
        const config: any = integration?.config;
        config.idTelegram = idTelegram;
        return this.prisma.integration.update({
            where: { id: integration?.id },
            data: { config },
        });
    }
}
