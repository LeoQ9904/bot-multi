import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class NotificationsService {
    constructor(
        @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: typeof admin,
        private readonly prisma: PrismaService
    ) { }

    async sendToUser(userId: string, title: string, body: string, data?: any) {
        console.log(`[NotificationsService] Preparing to send notification to user: ${userId}`);

        // Persist to database first
        const dbNotification = await this.prisma.notification.create({
            data: {
                userId,
                title,
                body,
                data: data || {},
            }
        });

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, fcmTokens: true }
        });

        if (!user) {
            console.error(`[NotificationsService] User not found: ${userId}`);
            return dbNotification;
        }

        if (user.fcmTokens.length === 0) {
            console.warn(`[NotificationsService] User ${user.email} (${userId}) has NO registered tokens. Saved to DB only.`);
            return dbNotification;
        }

        console.log(`[NotificationsService] User ${user.email} has ${user.fcmTokens.length} tokens. Sending...`);

        const message = {
            notification: { title, body },
            data: data || {},
            tokens: user.fcmTokens,
        };

        try {
            const response = await this.firebaseAdmin.messaging().sendEachForMulticast(message);
            console.log(`[NotificationsService] Multicast results for ${user.email}: ${response.successCount} success, ${response.failureCount} failure`);

            const tokensToRemove: string[] = [];
            response.responses.forEach((resp, idx) => {
                const token = user.fcmTokens[idx];
                if (resp.success) {
                    console.log(`  [OK] Token ${token.substring(0, 10)}... messageId: ${resp.messageId}`);
                } else {
                    const error = resp.error as any;
                    console.error(`  [FAIL] Token ${token.substring(0, 10)}... Error: ${error?.code} - ${error?.message}`);

                    // Cleanup invalid tokens
                    if (error?.code === 'messaging/registration-token-not-registered' ||
                        error?.code === 'messaging/invalid-registration-token') {
                        tokensToRemove.push(token);
                    }
                }
            });

            if (tokensToRemove.length > 0) {
                console.log(`[NotificationsService] Cleaning up ${tokensToRemove.length} invalid tokens for user ${user.email}`);
                await this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        fcmTokens: {
                            set: user.fcmTokens.filter(t => !tokensToRemove.includes(t))
                        }
                    }
                });
            }

            return { ...response, dbId: dbNotification.id };
        } catch (error) {
            console.error('[NotificationsService] Critical error in sendToUser:', error);
            // Even if FCM fails, the DB notification is already created
            return { dbId: dbNotification.id, error };
        }
    }

    async broadcastToAll(title: string, body: string, data?: any) {
        console.log('[NotificationsService] Starting broadcast to all users with tokens...');

        const usersWithTokens = await this.prisma.user.findMany({
            where: { fcmTokens: { isEmpty: false } },
            select: { id: true }
        });

        console.log(`[NotificationsService] Found ${usersWithTokens.length} users with registered tokens.`);

        const results = {
            successCount: 0,
            failureCount: 0,
            responses: [] as any[]
        };

        for (const user of usersWithTokens) {
            const res = await this.sendToUser(user.id, title, body, data);
            if (res) {
                if ('successCount' in res) {
                    results.successCount += res.successCount;
                    results.failureCount += res.failureCount;
                    results.responses.push(...res.responses);
                }
            }
        }

        console.log(`[NotificationsService] Broadcast finished. Total Success: ${results.successCount}, Total Failure: ${results.failureCount}`);
        return results;
    }

    async getNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }

    async markAsRead(notificationId: string, userId: string) {
        return this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }
}
