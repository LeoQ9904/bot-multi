<template>
    <div class="task-card" :class="[`status-${task.status}`]" :style="`--glow-color: ${glowColor}`">
        <div class="card-header">
            <div class="priority-info">
                <span class="priority-label" :class="priorityClass">{{ priorityLabel }}</span>
                <div class="priority-bolts">
                    <span v-for="i in 3" :key="i" class="material-symbols-outlined bolt-icon"
                        :class="{ 'font-fill': i <= task.priority, 'active': i <= task.priority }">
                        bolt
                    </span>
                </div>
            </div>
            <span class="scheduled-time">{{ formatTime(task.scheduledAt) }}</span>
        </div>

        <div class="card-content">
            <h3 class="task-title">{{ task.title }}</h3>
            <div class="task-tags">
                <span v-if="task.project" class="task-tag project-tag">{{ task.project }}</span>
                <span v-if="task.category" class="task-tag category-tag">{{ task.category }}</span>
            </div>
        </div>

        <!-- Quick Actions Bar (Hover) -->
        <div class="quick-actions-bar">
            <TaskQuickActions :task="task" @start="$emit('start', $event)" @stop="$emit('stop', $event)"
                @complete="$emit('complete', $event)" @cancel="$emit('cancel', $event)" @edit="$emit('edit', $event)"
                @more="$emit('more', $event)" @preview="$emit('preview', $event)" />
        </div>

        <div class="card-footer">
            <div class="duration-info">
                <span class="material-symbols-outlined">schedule</span>
                <span class="duration-text">{{ task.duration }} est.</span>
            </div>
            <div class="footer-actions">
                <button class="icon-btn" @click.stop="$emit('edit', task)">
                    <span>{{ statusLabel }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TaskQuickActions from './TaskQuickActions.vue';

const props = defineProps<{
    task: {
        id: number | string;
        title: string;
        project?: string | null;
        category: string;
        priority: number;
        tagColor: string;
        duration: string;
        status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
        scheduledAt: number;
    }
}>();

const formatTime = (ts: number) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const priorityLabel = computed(() => {
    if (props.task.priority === 3) return 'Alta Prioridad';
    if (props.task.priority === 2) return 'Media Prioridad';
    return 'Baja Prioridad';
});

const priorityClass = computed(() => {
    if (props.task.priority === 3) return 'priority-high';
    if (props.task.priority === 2) return 'priority-medium';
    return 'priority-low';
});

const glowColor = computed(() => {
    if (props.task.priority === 3) return 'rgba(248, 113, 113, 0.2)'; // --accent-red
    if (props.task.priority === 2) return 'rgba(99, 102, 241, 0.2)'; // --accent-primary
    return 'rgba(52, 211, 153, 0.1)'; // --accent-emerald
});

const statusLabel = computed(() => {
    if (props.task.status === 'pending') return 'Pendiente';
    if (props.task.status === 'in-progress') return 'En Progreso';
    if (props.task.status === 'completed') return 'Completado';
    return 'Cancelado';
});

defineEmits(['start', 'stop', 'complete', 'cancel', 'edit', 'more', 'preview']);
</script>

<style scoped>
.task-card {
    position: relative;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    border-radius: 1.25rem;
    padding: 1.25rem;
    height: 9rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px -10px var(--glow-color);
    border-color: var(--accent-primary);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.priority-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.priority-label {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.priority-high {
    color: var(--accent-red);
}

.priority-medium {
    color: var(--accent-primary);
}

.priority-low {
    color: var(--text-tertiary);
}

.priority-bolts {
    display: flex;
    gap: 2px;
}

.bolt-icon {
    font-size: 0.875rem;
    color: var(--bg-tertiary);
    font-variation-settings: 'FILL' 0;
}

.bolt-icon.active {
    color: var(--accent-amber);
}

.font-fill {
    font-variation-settings: 'FILL' 1;
}

.scheduled-time {
    font-size: 0.6875rem;
    color: var(--text-tertiary);
    font-weight: 500;
}

.card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.task-title {
    font-size: 0.9375rem;
    font-weight: 700;
    line-height: 1.25;
    color: var(--text-primary);
    margin: 0;
    transition: color 0.2s;
}

.task-card:hover .task-title {
    color: var(--accent-primary);
}

.task-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.task-tag {
    font-size: 0.5625rem;
    font-weight: 700;
    padding: 0.125rem 0.375rem;
    border-radius: 0.375rem;
    text-transform: uppercase;
}

.project-tag {
    background: var(--glow);
    color: var(--accent-primary);
    border: 1px solid var(--accent-primary);
    opacity: 0.8;
}

.category-tag {
    background: var(--glass-bg);
    color: var(--text-secondary);
    border: 1px solid var(--glass-border);
}

/* Quick Actions Bar */
.quick-actions-bar {
    position: absolute;
    inset: auto 0 0 0;
    padding: 0.75rem;
    background: linear-gradient(to top, var(--bg-primary), transparent);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    border-top: 1px solid var(--glass-border);
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.2s ease-out;
    z-index: 10;
}

.task-card:hover .quick-actions-bar {
    opacity: 1;
    transform: translateY(0);
}

.card-footer {
    padding-top: 1rem;
    border-top: 1px solid var(--glass-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.duration-info {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--text-tertiary);
}

.duration-info .material-symbols-outlined {
    font-size: 1rem;
}

.duration-text {
    font-size: 0.6875rem;
}

.footer-actions {
    display: flex;
    gap: 0.5rem;
}

.icon-btn {
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: color 0.2s;
}

.icon-btn:hover {
    color: var(--accent-primary);
}

.icon-btn .material-symbols-outlined {
    font-size: 1rem;
}

.task-card:hover .footer-actions {
    opacity: 0;
}

/* Status specific opacity */
.status-completed,
.status-cancelled {
    opacity: 0.6;
}
</style>
