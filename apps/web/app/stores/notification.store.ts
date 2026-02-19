import { defineStore } from 'pinia';

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
    }),

    getters: {
        unreadCount: (state) => state.notifications.filter(n => !n.isRead).length,
        sortedNotifications: (state) => [...state.notifications].sort((a, b) => b.receivedAt - a.receivedAt),
    },

    actions: {
        addNotification(notification: Omit<NotificationItem, 'id' | 'receivedAt' | 'isRead'>) {
            this.notifications.push({
                ...notification,
                id: Math.random().toString(36).substring(7),
                receivedAt: Date.now(),
                isRead: false,
            });

            // Limit to last 50 notifications
            if (this.notifications.length > 50) {
                this.notifications.shift();
            }
        },

        markAsRead(id: string) {
            const index = this.notifications.findIndex(n => n.id === id);
            if (index !== -1) {
                this.notifications[index].isRead = true;
            }
        },

        markAllAsRead() {
            this.notifications.forEach(n => n.isRead = true);
        },

        clearAll() {
            this.notifications = [];
        }
    },

    // Todo: persist notifications in localStorage if desired
});
