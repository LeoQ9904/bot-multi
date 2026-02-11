import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TasksService {
    private readonly storageBaseDir = path.join(process.cwd(), 'storage', 'users');

    constructor(private prisma: PrismaService) { }

    async create(userId: string, createTaskDto: CreateTaskDto) {
        const task = await this.prisma.task.create({
            data: {
                ...createTaskDto,
                userId,
                scheduledAt: BigInt(createTaskDto.scheduledAt),
            },
        });

        await this.syncUserTasks(userId);
        return this.serializeTask(task);
    }

    async findAll(userId: string) {
        const tasks = await this.prisma.task.findMany({
            where: { userId },
            orderBy: { scheduledAt: 'asc' },
        });
        return tasks.map((t) => this.serializeTask(t));
    }

    async findOne(userId: string, id: string) {
        const task = await this.prisma.task.findFirst({
            where: { id, userId },
        });
        return task ? this.serializeTask(task) : null;
    }

    async update(userId: string, id: string, updateTaskDto: UpdateTaskDto) {
        const data: any = { ...updateTaskDto };
        if (updateTaskDto.scheduledAt) data.scheduledAt = BigInt(updateTaskDto.scheduledAt);
        if (updateTaskDto.startedAt) data.startedAt = BigInt(updateTaskDto.startedAt);
        if (updateTaskDto.completedAt) data.completedAt = BigInt(updateTaskDto.completedAt);

        const task = await this.prisma.task.update({
            where: { id, userId },
            data,
        });

        await this.syncUserTasks(userId);
        return this.serializeTask(task);
    }

    async remove(userId: string, id: string) {
        await this.prisma.task.delete({
            where: { id, userId },
        });
        await this.syncUserTasks(userId);
        return { success: true };
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
            console.error(`Failed to sync tasks for user ${userId}:`, error);
            // We don't throw here to avoid failing the DB operation, 
            // but in a real app we might want more robust error handling
        }
    }

    private serializeTask(task: any) {
        return {
            ...task,
            scheduledAt: Number(task.scheduledAt),
            startedAt: task.startedAt ? Number(task.startedAt) : null,
            completedAt: task.completedAt ? Number(task.completedAt) : null,
        };
    }
}
