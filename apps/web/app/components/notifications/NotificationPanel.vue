<template>
    <BaseSidePanel :show="notificationStore.isPanelOpen" @close="notificationStore.togglePanel" title="Notificaciones"
        :subtitle="`Tienes ${notificationStore.unreadCount} notificaciones nuevas`">
        <!-- Mark all as read bar -->
        <template #top>
            <div class="action-bar" v-if="notificationStore.unreadCount > 0">
                <button class="btn-text-primary" @click="notificationStore.markAllAsRead">
                    <span class="material-symbols-outlined">done_all</span>
                    Marcar todo como leído
                </button>
            </div>
        </template>

        <!-- Scrollable Content -->
        <div v-if="notificationStore.notifications.length > 0">
            <!-- Recientes section (simplified categories for now) -->
            <section class="notification-section">
                <div class="section-header">
                    <span class="material-symbols-outlined section-icon">history</span>
                    <h3 class="section-title">Recientes</h3>
                </div>

                <div class="notifications-list">
                    <div v-for="notification in notificationStore.sortedNotifications" :key="notification.id"
                        class="notification-card" :class="{
                            'unread': !notification.isRead,
                            'ai-glow': notification.data?.type === 'ai',
                            'alert-glow': notification.data?.type === 'alert'
                        }" @click="markRead(notification.id)">
                        <!-- Intensity indicators based on type -->
                        <div v-if="notification.data?.type === 'ai'" class="type-indicator ai"></div>
                        <div v-else-if="notification.data?.type === 'alert'" class="type-indicator alert"></div>

                        <div class="card-inner">
                            <div class="card-icon" :class="getIconClass(notification.data?.type)">
                                <span class="material-symbols-outlined">{{
                                    getIcon(notification.data?.type) }}</span>
                            </div>

                            <div class="card-body">
                                <div class="card-header">
                                    <h4 class="notif-title">{{ notification.title }}</h4>
                                    <span class="notif-time">{{ formatTime(notification.receivedAt)
                                    }}</span>
                                </div>
                                <p class="notif-text">{{ notification.body }}</p>

                                <div class="notif-actions" v-if="notification.data?.btn_one_label">
                                    <NuxtLink class="action-btn primary" v-if="notification.data?.btn_one_label"
                                        :to="notification.data?.btn_one_url">
                                        {{ notification.data?.btn_one_label }}
                                    </NuxtLink>
                                    <NuxtLink class="action-btn secondary" v-if="notification.data?.btn_two_label"
                                        :to="notification.data?.btn_two_url">
                                        {{ notification.data?.btn_two_label }}
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
            <div class="empty-icon-wrapper">
                <span class="material-symbols-outlined">done_all</span>
            </div>
            <p>Estás al día con todo</p>
        </div>
    </BaseSidePanel>
</template>

<script setup lang="ts">
import BaseSidePanel from '../ui/BaseSidePanel.vue';
import { useNotificationStore } from '~/stores/notification.store';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const notificationStore = useNotificationStore();

const markRead = (id: string) => {
    notificationStore.markAsRead(id);
};

const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    return formatDistanceToNow(timestamp, { addSuffix: true, locale: es });
};

const getIcon = (type?: string) => {
    switch (type) {
        case 'ai': return 'auto_awesome';
        case 'alert': return 'warning';
        case 'task': return 'task_alt';
        default: return 'notifications';
    }
};

const getIconClass = (type?: string) => {
    switch (type) {
        case 'ai': return 'icon-ai';
        case 'alert': return 'icon-alert';
        case 'task': return 'icon-task';
        default: return 'icon-default';
    }
};
</script>

<style scoped>
/* Action Bar */
.action-bar {
    background: var(--glass-bg);
    padding: 0.5rem 1.5rem;
}

.btn-text-primary {
    background: transparent;
    border: none;
    color: var(--accent-primary);
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.25rem 0;
}

.btn-text-primary:hover {
    filter: brightness(1.2);
}

/* Header Enhancements */
.panel-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.pulse-indicator {
    width: 8px;
    height: 8px;
    background: var(--accent-primary);
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
    }

    70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
    }

    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
    }
}

.notification-section {
    margin-bottom: 2rem;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.section-icon {
    font-size: 1.1rem;
    color: var(--text-tertiary);
}

.section-title {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
    margin: 0;
}

/* Cards */
.notifications-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.notification-card {
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
    cursor: pointer;
}

.notification-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(var(--bg-tertiary-rgb), 0.8);
}

.notification-card.unread {
    background: rgba(var(--accent-primary-rgb), 0.03);
}

.type-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
}

.type-indicator.ai {
    background: var(--accent-purple);
}

.type-indicator.alert {
    background: var(--accent-red);
}

.ai-glow {
    box-shadow: 0 0 15px -3px rgba(192, 132, 252, 0.15);
}

.alert-glow {
    box-shadow: 0 0 15px -3px rgba(248, 113, 113, 0.15);
}

.card-inner {
    padding: 1rem;
    display: flex;
    gap: 1rem;
}

.card-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.icon-ai {
    background: rgba(192, 132, 252, 0.15);
    color: var(--accent-purple);
}

.icon-alert {
    background: rgba(248, 113, 113, 0.15);
    color: var(--accent-red);
}

.icon-task {
    background: rgba(96, 165, 250, 0.15);
    color: var(--accent-blue);
}

.icon-default {
    background: var(--glass-bg);
    color: var(--text-tertiary);
}

.card-body {
    flex: 1;
    min-width: 0;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
}

.notif-title {
    font-size: 0.9rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
}

.notif-time {
    font-size: 0.65rem;
    color: var(--text-tertiary);
    white-space: nowrap;
}

.notif-text {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
}

.notif-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.action-btn {
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    text-decoration: none;
}

.action-btn.primary {
    background: var(--accent-primary);
    color: white;
}

.action-btn.secondary {
    background: var(--glass-bg);
    color: var(--text-primary);
}

/* Empty State */
.empty-state {
    padding: 2rem 1rem;
    text-align: center;
    opacity: 0.5;
}

.empty-icon-wrapper {
    width: 48px;
    height: 48px;
    border: 2px dashed var(--text-tertiary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
}

.empty-state p {
    font-size: 0.8rem;
    color: var(--text-tertiary);
}
</style>
