import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TasksService } from '../tasks/tasks.service';

import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
        private readonly eventEmitter: EventEmitter2,
        @Inject(forwardRef(() => TasksService))
        private readonly tasksService: TasksService,
    ) { }

    /**
     * Schedules daily work plan jobs for the rest of the current month.
     */
    async scheduleMonthlyDailyPlans(userId: string) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-indexed
        const lastDay = new Date(year, month + 1, 0).getDate();
        const today = now.getDate();

        this.logger.log(`Scheduling monthly daily plans for user ${userId} from day ${today} to ${lastDay}...`);

        for (let day = today; day <= lastDay; day++) {
            // Schedule for 8:00 AM COL (GMT-5)
            // 8:00 AM COL = 1:00 PM UTC
            const scheduledFor = new Date(Date.UTC(year, month, day, 13, 0, 0));
            const dateStr = scheduledFor.toISOString().split('T')[0];
            const jobId = `daily-plan-${userId}-${dateStr}`;

            await this.prisma.scheduledJob.upsert({
                where: { id: jobId },
                update: {
                    scheduledFor,
                    status: 'pending'
                },
                create: {
                    id: jobId,
                    userId,
                    type: 'DAILY_PLAN',
                    scheduledFor,
                    status: 'pending',
                    metadata: { date: dateStr }
                }
            });
        }
    }

    /**
     * Cancels all future pending daily plan jobs for a user.
     */
    async cancelFutureDailyPlans(userId: string) {
        const now = new Date();
        this.logger.log(`Canceling future daily plans for user ${userId}...`);

        await this.prisma.scheduledJob.deleteMany({
            where: {
                userId,
                type: 'DAILY_PLAN',
                status: 'pending',
                scheduledFor: { gt: now }
            }
        });
    }

    /**
     * On the 1st of every month, schedule the daily plans for all users with the integration active.
     */
    @Cron('0 5 1 * *', { timeZone: 'America/Bogota' })
    async handleMonthlyScheduling() {
        this.logger.log('Starting monthly global scheduling for Daily Summary service...');
        const activeIntegrations = await this.prisma.integration.findMany({
            where: { type: 'DAILY_PLAN', isActive: true }
        });

        for (const integration of activeIntegrations) {
            try {
                await this.scheduleMonthlyDailyPlans(integration.userId);
            } catch (error) {
                this.logger.error(`Failed to perform monthly scheduling for user ${integration.userId}:`, error);
            }
        }
    }

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
            case 'DAILY_PLAN':
                return this.handleDailyPlanJob(job);
            default:
                this.logger.warn(`Unknown job type: ${job.type}`);
        }
    }

    private async handleDailyPlanJob(job: any) {
        const todayStr = new Date(job.scheduledFor).toISOString().split('T')[0];
        this.logger.log(`Processing DAILY_PLAN for user ${job.userId} on ${todayStr}...`);

        try {
            const plan = await this.tasksService.generateDailyPlan(job.userId, todayStr);

            if (plan && !plan.message) {
                const message = plan.raw || '¡Tu plan de trabajo para hoy está listo!';

                // Web App Notification
                await this.notificationsService.sendToUser(
                    job.userId,
                    'Tu Plan de Trabajo para Hoy',
                    message,
                    {
                        type: 'daily_plan',
                        btn_one_label: "Ver planificación",
                        btn_one_url: "/task"
                    }
                );

                // Telegram Notification
                this.eventEmitter.emit('notification.send', {
                    userId: job.userId,
                    channel: 'TELEGRAM',
                    message: `📝 *Tu Plan de Trabajo para Hoy*\n\n${message}`,
                });
            }
        } catch (error) {
            this.logger.error(`Failed to handle DAILY_PLAN for user ${job.userId}:`, error);
            throw error;
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
