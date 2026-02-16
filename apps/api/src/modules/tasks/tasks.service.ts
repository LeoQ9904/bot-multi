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
                scheduledAt: new Date(createTaskDto.scheduledAt),
            },
        });

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

        const task = await this.prisma.task.update({
            where: { id, userId },
            data,
        });

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
}
