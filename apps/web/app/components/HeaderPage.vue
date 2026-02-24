<script setup lang="ts">
import { useNotificationStore } from '~/stores/notification.store';


const props = defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    }
})



// constantes
const notificationStore = useNotificationStore();
const { isDarkMode, toggleTheme: cycleTheme } = useTheme();

// funciones
const toggleTheme = () => {
    cycleTheme();
};
</script>

<template>
    <header class="header-page">
        <div>
            <h1 class="page-title">{{ title }}</h1>
            <p class="page-subtitle">{{ subtitle }}</p>
        </div>
        <div class="header-actions">
            <button class="icon-btn" @click="toggleTheme">
                <span class="material-symbols-outlined">{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</span>
            </button>
            <div class="notification-wrapper">
                <button class="icon-btn" @click="notificationStore.togglePanel(true)">
                    <span class="material-symbols-outlined">notifications</span>
                    <span class="badge" v-if="notificationStore.unreadCount > 0">{{ notificationStore.unreadCount
                        }}</span>
                </button>
            </div>
        </div>
    </header>
</template>

<style scoped>
.header-page {
    margin-bottom: 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.page-title {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
}

.page-subtitle {
    color: var(--text-tertiary);
    font-size: 1.1rem;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.notification-wrapper {
    position: relative;
}

.icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid var(--glass-border);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.icon-btn:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.notification-wrapper {
    position: relative;
}

.badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--accent-primary);
    color: white;
    font-size: 0.65rem;
    font-weight: 800;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    border: 2px solid var(--bg-secondary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}


@media (max-width: 768px) {
    .page-title {
        font-size: 2rem;
    }

    .header-actions {
        display: none;
    }
}
</style>