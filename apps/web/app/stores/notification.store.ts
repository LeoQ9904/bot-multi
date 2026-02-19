import { defineStore } from 'pinia';
import { useNotificationService } from '../services/notification.service';
import { useFirebaseAuth } from '../composables/useAuth';

export interface NotificationItem {
    id: string;
    title: string;
    body: string;
    receivedAt: number;
    isRead: boolean;
    data?: any;
}

export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        notifications: [] as NotificationItem[],
        loading: false,
    }),

    getters: {
        unreadCount: (state) => state.notifications.filter(n => !n.isRead).length,
        sortedNotifications: (state) => [...state.notifications].sort((a, b) => b.receivedAt - a.receivedAt),
    },

    actions: {
        async fetchNotifications() {
            const { user, loading: authLoading } = useFirebaseAuth();
            const notificationService = useNotificationService();

            // Wait if auth is still initializing
            if (authLoading.value) {
                console.log('[NotificationStore] Waiting for auth to initialize...');
                return;
            }

            if (!user.value) {
                console.warn('[NotificationStore] No user available for fetching notifications.');
                return;
            }

            this.loading = true;
            try {
                const idToken = await user.value.getIdToken();
                const response = await notificationService.getNotifications(idToken);

                // ApiService wraps the result in a .data property
                const data = response.data;

                if (Array.isArray(data)) {
                    this.notifications = data.map((n: any) => ({
                        id: n.id,
                        title: n.title,
                        body: n.body,
                        receivedAt: new Date(n.createdAt).getTime(),
                        isRead: n.isRead,
                        data: n.data
                    }));
                    console.log(`[NotificationStore] Loaded ${this.notifications.length} notifications.`);
                }
            } catch (error) {
                console.error('[NotificationStore] Error fetching notifications:', error);
            } finally {
                this.loading = false;
            }
        },

        addNotification(notification: any) {
            // This adds real-time notifications received via FCM while app is open
            this.notifications.unshift({
                id: notification.id || `local-${Math.random().toString(36).substring(7)}`,
                title: notification.title,
                body: notification.body,
                receivedAt: Date.now(),
                isRead: false,
                data: notification.data,
            });

            if (this.notifications.length > 50) {
                this.notifications = this.notifications.slice(0, 50);
            }
        },

        async markAsRead(id: string) {
            const { user } = useFirebaseAuth();
            const notificationService = useNotificationService();
            if (!user.value) return;

            const notification = this.notifications.find(n => n.id === id);
            if (notification) {
                notification.isRead = true;
            }

            try {
                const idToken = await user.value.getIdToken();
                await notificationService.markRead(id, idToken);
            } catch (error) {
                console.error('[NotificationStore] Error marking as read:', error);
            }
        },

        async markAllAsRead() {
            const { user } = useFirebaseAuth();
            const notificationService = useNotificationService();
            if (!user.value) return;

            this.notifications.forEach(n => n.isRead = true);

            try {
                const idToken = await user.value.getIdToken();
                await notificationService.markAllRead(idToken);
            } catch (error) {
                console.error('[NotificationStore] Error marking all as read:', error);
            }
        },

        clearAll() {
            this.notifications = [];
        }
    },
});
