import { Injectable, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import * as fs from 'fs';
import * as path from 'path';

import { SchedulerService } from '../scheduler/scheduler.service';
import { AIService } from '../ai/services/ai.service';

@Injectable()
export class TasksService {
    private readonly storageBaseDir = path.join(process.cwd(), 'storage', 'users');

    constructor(
        private prisma: PrismaService,
        private schedulerService: SchedulerService,
        @Inject(forwardRef(() => AIService))
        private aiService: AIService
    ) { }

    async create(userId: string, createTaskDto: CreateTaskDto) {
        const scheduledAt = new Date(createTaskDto.scheduledAt);
        const summary = await this.aiService.generateTaskSummary(JSON.stringify(createTaskDto));
        const task = await this.prisma.task.create({
            data: {
                ...createTaskDto,
                userId,
                scheduledAt,
                summary,
            },
        });

        // Schedule notification job
        if (task.status === 'pending') {
            await this.schedulerService.scheduleJob(
                userId,
                'TASK_REMINDER',
                scheduledAt,
                { taskId: task.id }
            );
        }

        await this.syncUserTasks(userId);
        return task;
    }

    async findAll(userId: string) {
        const tasks = await this.prisma.task.findMany({
            where: { userId },
            orderBy: { scheduledAt: 'asc' },
        });
        return tasks;
    }

    async findOne(userId: string, id: string) {
        const task = await this.prisma.task.findFirst({
            where: { id, userId },
        });
        return task;
    }

    async update(userId: string, id: string, updateTaskDto: UpdateTaskDto) {
        const data: any = { ...updateTaskDto };
        if (updateTaskDto.scheduledAt) {
            data.scheduledAt = new Date(updateTaskDto.scheduledAt);
        }

        const summary = await this.aiService.generateTaskSummary(JSON.stringify(updateTaskDto));
        data.summary = summary;

        const task = await this.prisma.task.update({
            where: { id, userId },
            data,
        });

        // Update or cancel notification job
        if (task.status === 'completed') {
            // Logic to cancel could be added to SchedulerService, 
            // but for now the processor checks status.
        } else if (task.scheduledAt) {
            await this.schedulerService.scheduleJob(
                userId,
                'TASK_REMINDER',
                task.scheduledAt,
                { taskId: task.id }
            );
        }

        await this.syncUserTasks(userId);
        return task;
    }

    async remove(userId: string, id: string) {
        await this.prisma.task.delete({
            where: { id, userId },
        });
        await this.syncUserTasks(userId);
        return { success: true };
    }

    async generateDailyPlan(userId: string, date: string) {
        // 1. Get tasks for the specific date
        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setUTCHours(23, 59, 59, 999);

        const tasks = await this.prisma.task.findMany({
            where: {
                userId,
                scheduledAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { scheduledAt: 'asc' },
        });

        if (tasks.length === 0) {
            return { message: 'No hay tareas programadas para esta fecha.' };
        }

        // excluir datos de startat, completet y updateat del listado de tareas
        const tasksWithoutDates = tasks.map((task) => {
            const { createdAt, updatedAt, completedAt, startedAt, ...rest } = task;
            return rest;
        });

        // 2. Call AI service to generate a plan
        const planContent = await this.aiService.generateWorkPlan(tasksWithoutDates, date);
        let planJson: any;
        try {
            planJson = JSON.parse(planContent);
        } catch (e) {
            console.error('Failed to parse AI work plan response:', planContent);
            // Fallback: just store the text if it's not valid JSON
            planJson = { raw: planContent };
        }

        // 3. Save to storage
        const userPlansDir = path.join(this.storageBaseDir, userId, 'plans');
        if (!fs.existsSync(userPlansDir)) {
            fs.mkdirSync(userPlansDir, { recursive: true });
        }

        const filePath = path.join(userPlansDir, `plan-${date}.json`);
        fs.writeFileSync(filePath, JSON.stringify(planJson, null, 2));

        return planJson;
    }

    async getDailyPlan(userId: string, date: string) {
        const userPlansDir = path.join(this.storageBaseDir, userId, 'plans');
        const filePath = path.join(userPlansDir, `plan-${date}.json`);
        if (fs.existsSync(filePath)) {
            const planJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            return planJson;
        }
        return { message: 'No hay plan para esta fecha.' };
    }

    private async syncUserTasks(userId: string) {
        try {
            const tasks = await this.findAll(userId);
            const userDir = path.join(this.storageBaseDir, userId);

            if (!fs.existsSync(userDir)) {
                fs.mkdirSync(userDir, { recursive: true });
            }

            const filePath = path.join(userDir, 'tasks.json');
            fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
        } catch (error) {
            console.error(`Failed to sync tasks for user ${userId}: `, error);
            // We don't throw here to avoid failing the DB operation, 
            // but in a real app we might want more robust error handling
        }
    }
}
