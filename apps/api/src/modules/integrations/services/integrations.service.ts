import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class IntegrationsService {
    constructor(private readonly prisma: PrismaService) { }

    async createOrUpdate(userId: string, type: string, config: any, name?: string) {
        console.log(`IntegrationsService: createOrUpdate for user ${userId}, type ${type}`);
        const existing = await this.prisma.integration.findFirst({
            where: { userId, type },
        });

        if (existing) {
            console.log(`IntegrationsService: Updating existing integration ${existing.id}`);
            return this.prisma.integration.update({
                where: { id: existing.id },
                data: { config, name },
            });
        }

        console.log(`IntegrationsService: Creating new integration record...`);
        try {
            const result = await this.prisma.integration.create({
                data: {
                    userId,
                    type,
                    config,
                    name,
                },
            });
            console.log(`IntegrationsService: Integration created with ID ${result.id}`);
            return result;
        } catch (error) {
            console.error('IntegrationsService: Error creating integration:', error);
            throw error;
        }
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

    async remove(id: string, userId: string) {
        await this.findOne(id, userId);
        return this.prisma.integration.delete({
            where: { id },
        });
    }
}
