<template>
    <div class="aside-content-wrapper">
        <div class="insight-card" v-if="insightText">
            <div class="insight-header">
                <span class="material-symbols-outlined">analytics</span>
                <span class="insight-label">IA Insight</span>
            </div>
            <div v-html="insightText" class="insight-text"></div>
        </div>

        <div class="metrics-section">
            <h3 class="aside-section-title">Métricas de Hoy</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <span class="metric-value">{{ hoursToday }} </span>
                    <span class="metric-label">Trabajo Estimado</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value">{{ taskCompleted }}</span>
                    <span class="metric-label">Tareas Completadas</span>
                </div>
            </div>
        </div>

        <div class="events-section">
            <h3 class="aside-section-title">Próximos Eventos</h3>
            <div class="events-list custom-scrollbar">
                <div v-for="event in taskPending" :key="event.id" class="event-item">
                    <div class="event-indicator" :style="{ background: event.tagColor }"></div>
                    <div class="event-info">
                        <p class="event-name">{{ event.title }}</p>
                        <p class="event-time">{{ formatStartAt(event.scheduledAt, event.duration) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    insightText: string | null;
    hoursToday: string | number;
    taskCompleted: string;
    taskPending: any[];
}>();

const formatStartAt = (ts: number, duration: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
};
</script>

<style scoped>
.aside-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.insight-card {
    padding: 0.5rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 1rem;
}

.insight-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--accent-primary);
    margin-bottom: 0.5rem;
}

.insight-label {
    font-size: 0.625rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.insight-text {
    font-size: 0.75rem;
    line-height: 1.6;
    color: var(--text-secondary);
}

.aside-section-title {
    font-size: 0.6875rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.2rem;
    color: var(--text-tertiary);
    margin-bottom: 1rem;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
}

.metric-card {
    padding: 1rem;
    border-radius: 1.25rem;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    text-align: center;
}

.metric-value {
    display: block;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
}

.metric-label {
    font-size: 0.625rem;
    font-weight: 700;
    color: var(--text-tertiary);
    text-transform: uppercase;
}

.events-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 40vh;
    overflow-y: auto;
}

.event-item {
    display: flex;
    gap: 1rem;
}

.event-indicator {
    width: 0.25rem;
    height: 2.5rem;
    border-radius: 1rem;
}

.event-name {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.event-time {
    font-size: 0.6875rem;
    color: var(--text-tertiary);
    margin-top: 0.125rem;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--glass-border);
    border-radius: 10px;
}
</style>
