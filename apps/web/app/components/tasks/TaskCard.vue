<template>
    <div class="task-card" :class="[`status-${task.status}`]">
        <div class="task-info">
            <div class="status-indicator" :class="task.tagColor"></div>
            <div class="task-text">
                <div class="title-row">
                    <h3 class="task-title">{{ task.title }}</h3>
                    <span v-if="task.status !== 'pending'" class="status-badge" :class="task.status">
                        {{ getStatusLabel(task.status) }}
                    </span>
                </div>
                <div class="task-subtext">
                    <span v-if="task.category" class="task-category">{{ task.category }}</span>
                    <span v-if="task.project" class="task-project">Proyecto: {{ task.project }}</span>
                </div>
            </div>
        </div>

        <div class="task-meta">
            <div class="priority-badges">
                <span v-for="i in 3" :key="i" class="material-symbols-outlined bolt-icon"
                    :class="{ filled: i <= task.priority }">
                    bolt
                </span>
            </div>
            <div class="task-duration">
                <span class="material-symbols-outlined">schedule</span>
                <span>{{ task.duration }}</span>
                <span class="time-divider" v-if="task.scheduledAt">|</span>
                <span v-if="task.scheduledAt" class="scheduled-time">
                    {{ formatTime(task.scheduledAt) }}
                </span>
            </div>
        </div>

        <!-- Hover Actions -->
        <div class="task-actions">
            <button class="preview-btn-icon" @click="$emit('preview', task)" title="Ver detalles">
                <span class="material-symbols-outlined">visibility</span>
            </button>

            <button v-if="task.status === 'in-progress'" class="action-btn stop-btn" @click="$emit('stop', task)">
                <span class="material-symbols-outlined">stop</span>
                Detener
            </button>
            <button v-else class="action-btn start-btn" @click="$emit('start', task)">
                <span class="material-symbols-outlined">play_arrow</span>
                Iniciar
            </button>

            <button class="action-btn complete-btn" @click="$emit('complete', task)">
                <span class="material-symbols-outlined">check_circle</span>
                Realizada
            </button>

            <button class="action-btn cancel-btn" @click="$emit('cancel', task)">
                <span class="material-symbols-outlined">cancel</span>
                Cancelar
            </button>

            <button class="more-btn" @click="$emit('more', task)">
                <span class="material-symbols-outlined">more_vert</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
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

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'in-progress': return 'Tarea Iniciada';
        case 'completed': return 'Realizada';
        case 'cancelled': return 'Cancelada';
        default: return '';
    }
};

defineEmits(['start', 'stop', 'complete', 'cancel', 'edit', 'more', 'preview']);
</script>

<style scoped>
.title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.25rem;
}

.status-badge {
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 6px;
    letter-spacing: 0.05em;
}

.status-badge.in-progress {
    background: var(--glow);
    color: var(--accent-primary);
}

.status-badge.completed {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
}

.status-badge.cancelled {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.task-card.status-completed,
.task-card.status-cancelled {
    opacity: 0.6;
}

.task-card.status-in-progress {
    border-color: var(--accent-primary);
    box-shadow: 0 0 20px var(--glow);
    transform: scale(1.01);
}

.stop-btn {
    background: #ef4444 !important;
    color: white !important;
}

.complete-btn {
    background: #10b981 !important;
    color: white !important;
}

.cancel-btn {
    background: var(--bg-tertiary) !important;
    border-color: #ef4444 !important;
    color: #ef4444 !important;
}

.cancel-btn:hover {
    background: #ef4444 !important;
    color: white !important;
}

.task-card {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.task-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px var(--shadow);
    border-color: var(--accent-primary);
}

.task-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-indicator.red {
    background: #ef4444;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
}

.status-indicator.amber {
    background: #f59e0b;
}

.status-indicator.emerald {
    background: #10b981;
}

.task-subtext {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.25rem;
    flex-wrap: wrap;
}

.task-category {
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--accent-primary);
    background: var(--glow);
    padding: 1px 6px;
    border-radius: 4px;
    text-transform: uppercase;
}

.task-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    word-break: break-word;
}

.task-project {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    word-break: break-word;
}

.task-meta {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.priority-badges {
    display: flex;
    color: #fbbf24;
}

.bolt-icon {
    font-size: 1.1rem;
    opacity: 0.3;
}

.bolt-icon.filled {
    opacity: 1;
    font-variation-settings: 'FILL' 1;
}

.task-duration {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--text-tertiary);
    font-size: 0.85rem;
    font-weight: 500;
}

.task-duration .material-symbols-outlined {
    font-size: 1rem;
}

.time-divider {
    margin: 0 0.5rem;
    color: var(--glass-border);
    font-weight: 300;
}

.scheduled-time {
    color: var(--accent-primary);
    font-weight: 700;
}

.task-actions {
    position: absolute;
    inset: 0;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    gap: 1rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease-in-out;
    z-index: 10;
}

.task-card:hover .task-actions {
    opacity: 0.98;
    pointer-events: auto;
}

.preview-btn-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.preview-btn-icon:hover {
    background: var(--bg-secondary);
    color: var(--accent-primary);
    border-color: var(--accent-primary);
    transform: scale(1.05);
}

.action-btn {
    height: 40px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.start-btn {
    flex-grow: 1;
    background: var(--accent-primary);
    color: white;
    border: none;
}

.start-btn:hover {
    filter: brightness(1.1);
    transform: scale(1.02);
}

.edit-btn {
    padding: 0 1.25rem;
    background: transparent;
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
}

.edit-btn:hover {
    background: var(--glass-bg);
}

.more-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
}

@media (max-width: 768px) {
    .task-card {
        padding: 1rem;
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
        width: 100%;
        box-sizing: border-box;
    }

    .task-info {
        width: 100%;
        overflow: hidden;
    }

    .task-text {
        flex-grow: 1;
        overflow: hidden;
    }

    .task-meta {
        width: 100%;
        justify-content: space-between;
        padding-top: 0.75rem;
        border-top: 1px solid var(--glass-border);
    }

    .task-actions {
        padding: 0 1rem;
        gap: 0.5rem;
    }

    .start-btn {
        font-size: 0.8rem;
    }

    .edit-btn {
        padding: 0 0.75rem;
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .priority-badges {
        display: none;
    }
}
</style>
