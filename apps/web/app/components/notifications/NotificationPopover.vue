<template>
    <div class="notification-popover glass-panel shadow-lg" v-if="isOpen">
        <div class="popover-header">
            <h3>Notificaciones</h3>
            <div class="header-actions">
                <button class="btn-text" @click="notificationStore.markAllAsRead"
                    v-if="notificationStore.unreadCount > 0">
                    Marcar todo como leído
                </button>
                <button class="btn-text" @click="notificationStore.clearAll">Limpiar</button>
            </div>
        </div>

        <div class="notifications-list" v-if="notificationStore.notifications.length > 0">
            <div v-for="notification in notificationStore.sortedNotifications" :key="notification.id"
                class="notification-item" :class="{ 'unread': !notification.isRead }"
                @click="markRead(notification.id)">
                <div class="item-content">
                    <p class="notification-title">{{ notification.title }}</p>
                    <p class="notification-body">{{ notification.body }}</p>
                    <span class="notification-time">{{ formatTime(notification.receivedAt) }}</span>
                </div>
                <div class="unread-indicator" v-if="!notification.isRead"></div>
            </div>
        </div>

        <div class="empty-state" v-else>
            <span class="material-symbols-outlined">notifications_off</span>
            <p>No tienes notificaciones</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useNotificationStore } from '~/stores/notification.store';
import { useFirebaseAuth } from '~/composables/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const props = defineProps<{
    isOpen: boolean;
}>();

const notificationStore = useNotificationStore();
const { user, loading: authLoading } = useFirebaseAuth();

// Fetch notifications when the component is mounted
onMounted(() => {
    if (!authLoading.value && user.value) {
        notificationStore.fetchNotifications();
    }
});

// Watch for auth settling to fetch
watch([user, authLoading], ([newUser, loading]) => {
    if (!loading && newUser) {
        notificationStore.fetchNotifications();
    }
}, { immediate: true });

// Also fetch when opened to ensure fresh data
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        notificationStore.fetchNotifications();
    }
});

const markRead = (id: string) => {
    notificationStore.markAsRead(id);
};

const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    return formatDistanceToNow(timestamp, { addSuffix: true, locale: es });
};
</script>

<style scoped>
.notification-popover {
    position: absolute;
    top: 100%;
    right: 0;
    width: 320px;
    max-height: 400px;
    margin-top: 0.5rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--glass-border);
    background: var(--bg-secondary);
}

.popover-header {
    padding: 1rem;
    border-bottom: 1px solid var(--glass-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.popover-header h3 {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-text {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
}

.notifications-list {
    overflow-y: auto;
    flex: 1;
}

.notification-item {
    padding: 1rem;
    border-bottom: 1px solid var(--glass-border);
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    gap: 0.75rem;
    position: relative;
}

.notification-item:hover {
    background: var(--bg-tertiary);
}

.notification-item.unread {
    background: rgba(var(--accent-primary-rgb), 0.05);
}

.item-content {
    flex: 1;
}

.notification-title {
    font-weight: 700;
    font-size: 0.9rem;
    margin: 0 0 0.25rem 0;
    color: var(--text-primary);
}

.notification-body {
    font-size: 0.85rem;
    margin: 0 0 0.5rem 0;
    color: var(--text-secondary);
    line-height: 1.4;
}

.notification-time {
    font-size: 0.75rem;
    color: var(--text-tertiary);
}

.unread-indicator {
    width: 8px;
    height: 8px;
    background: var(--accent-primary);
    border-radius: 50%;
    position: absolute;
    top: 1.25rem;
    right: 1rem;
}

.empty-state {
    padding: 3rem 1rem;
    text-align: center;
    color: var(--text-tertiary);
}

.empty-state .material-symbols-outlined {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
}

.empty-state p {
    font-size: 0.9rem;
}

@media (max-width: 640px) {
    .notification-popover {
        position: fixed;
        top: auto;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        max-height: 70vh;
        border-radius: 24px 24px 0 0;
        margin-top: 0;
    }
}
</style>
