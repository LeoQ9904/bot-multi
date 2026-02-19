import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    /**
     * Schedules or updates a job in the database.
     */
    async scheduleJob(userId: string, type: string, scheduledFor: Date, metadata?: any) {
        // We use an upsert-like logic if it's a task reminder to avoid duplicates per task
        const jobId = metadata?.taskId ? `task-reminder-${metadata.taskId}` : undefined;

        if (jobId) {
            return this.prisma.scheduledJob.upsert({
                where: { id: jobId },
                create: {
                    id: jobId,
                    userId,
                    type,
                    scheduledFor,
                    metadata: metadata || {},
                },
                update: {
                    scheduledFor,
                    status: 'pending', // Reset if it was failed/completed and moved
                    metadata: metadata || {},
                }
            });
        }

        return this.prisma.scheduledJob.create({
            data: {
                userId,
                type,
                scheduledFor,
                metadata: metadata || {},
            }
        });
    }

    /**
     * Polls for pending jobs every minute.
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        const now = new Date();
        const pendingJobs = await this.prisma.scheduledJob.findMany({
            where: {
                status: 'pending',
                scheduledFor: { lte: now },
            },
            include: { user: true }
        });

        if (pendingJobs.length === 0) return;

        this.logger.log(`Processing ${pendingJobs.length} scheduled jobs...`);

        for (const job of pendingJobs) {
            try {
                await this.processJob(job);
                await this.prisma.scheduledJob.update({
                    where: { id: job.id },
                    data: { status: 'completed' }
                });
            } catch (error) {
                this.logger.error(`Failed to process job ${job.id}:`, error);
                await this.prisma.scheduledJob.update({
                    where: { id: job.id },
                    data: { status: 'failed' }
                });
            }
        }
    }

    private async processJob(job: any) {
        switch (job.type) {
            case 'TASK_REMINDER':
                return this.handleTaskReminder(job);
            case 'DAILY_SUMMARY':
                return this.handleDailySummary(job);
            default:
                this.logger.warn(`Unknown job type: ${job.type}`);
        }
    }

    private async handleTaskReminder(job: any) {
        const taskId = job.metadata?.taskId;
        if (!taskId) return;

        const task = await this.prisma.task.findUnique({
            where: { id: taskId }
        });

        if (!task || task.status === 'completed') {
            this.logger.log(`Skipping reminder for task ${taskId}: not found or already completed.`);
            return;
        }

        await this.notificationsService.sendToUser(
            job.userId,
            'Recordatorio de Tarea',
            `Es hora de: ${task.title}`,
            {
                type: 'task',
                btn_one_label: "Ver tarea",
                btn_one_url: `/task?view=${task.id}`
            }
        );

        // Emit event for other integrations (e.g., Telegram)
        this.eventEmitter.emit('notification.send', {
            userId: job.userId,
            channel: 'TELEGRAM',
            message: `Recordatorio de Tarea: ${task.title}`,
        });
    }

    private async handleDailySummary(job: any) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tasks = await this.prisma.task.findMany({
            where: {
                userId: job.userId,
                status: 'pending',
                scheduledAt: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        if (tasks.length === 0) {
            return this.notificationsService.sendToUser(
                job.userId,
                'Resumen Diario',
                'No tienes tareas pendientes para hoy. ¡Disfruta tu día!'
            );
        }

        await this.notificationsService.sendToUser(
            job.userId,
            'Resumen Diario',
            `Hoy tienes ${tasks.length} tareas pendientes. ¡Vamos a por ello!`,
            { type: 'daily_summary' }
        );
    }
}
