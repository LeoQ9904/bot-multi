import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async getOrCreateUser(firebaseUser: any): Promise<User> {
        const { uid, email, name } = firebaseUser;

        return this.prisma.user.upsert({
            where: { firebaseUid: uid },
            update: {
                email: email || '',
                name: name || null,
            },
            create: {
                firebaseUid: uid,
                email: email || '',
                name: name || null,
            },
        });
    }

    async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { firebaseUid },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async addFcmToken(userId: string, token: string): Promise<User> {
        const user = await this.findById(userId);
        if (!user) throw new Error('User not found');

        const currentTokens = user.fcmTokens || [];
        if (currentTokens.includes(token)) return user;

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                fcmTokens: {
                    set: [...currentTokens, token]
                }
            }
        });
    }

    async removeFcmToken(userId: string, token: string): Promise<User> {
        const user = await this.findById(userId);
        if (!user) throw new Error('User not found');

        const currentTokens = user.fcmTokens || [];
        if (!currentTokens.includes(token)) return user;

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                fcmTokens: {
                    set: currentTokens.filter(t => t !== token)
                }
            }
        });
    }
}
