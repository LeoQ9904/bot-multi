import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotesService {
    private readonly storageBaseDir = path.join(process.cwd(), 'storage', 'users');

    constructor(private prisma: PrismaService) { }

    async create(userId: string, createNoteDto: CreateNoteDto) {
        console.log('Entra a crear notas service');
        const note = await this.prisma.note.create({
            data: {
                ...createNoteDto,
                userId,
            },
        });
        console.log('Nota creada');
        await this.syncUserNotes(userId);
        console.log('Nota sincronizada');
        return note;
    }

    async findAll(userId: string) {
        return this.prisma.note.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(userId: string, id: string) {
        return this.prisma.note.findFirst({
            where: { id, userId },
        });
    }

    async update(userId: string, id: string, updateNoteDto: UpdateNoteDto) {
        const note = await this.prisma.note.update({
            where: { id, userId },
            data: updateNoteDto,
        });

        await this.syncUserNotes(userId);
        return note;
    }

    async remove(userId: string, id: string) {
        await this.prisma.note.delete({
            where: { id, userId },
        });
        await this.syncUserNotes(userId);
        return { success: true };
    }

    private async syncUserNotes(userId: string) {
        try {
            console.log('Entra a sincronizar notas');
            const notes = await this.findAll(userId);
            const userDir = path.join(this.storageBaseDir, userId);

            if (!fs.existsSync(userDir)) {
                fs.mkdirSync(userDir, { recursive: true });
            }

            const filePath = path.join(userDir, 'notes.json');
            fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));
            console.log('Notas sincronizadas');
        } catch (error) {
            console.error(`Failed to sync notes for user ${userId}:`, error);
        }
    }
}
