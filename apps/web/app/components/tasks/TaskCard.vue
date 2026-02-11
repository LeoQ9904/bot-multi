<template>
    <div class="task-card">
        <div class="task-info">
            <div class="status-indicator" :class="task.tagColor"></div>
            <div class="task-text">
                <h3 class="task-title">{{ task.title }}</h3>
                <p v-if="task.project" class="task-project">Proyecto: {{ task.project }}</p>
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
            </div>
        </div>

        <!-- Hover Actions -->
        <div class="task-actions">
            <button class="action-btn start-btn" @click="$emit('start', task)">
                <span class="material-symbols-outlined">play_arrow</span>
                Iniciar
            </button>
            <button class="action-btn edit-btn" @click="$emit('edit', task)">
                Editar
            </button>
            <button class="more-btn" @click="$emit('more', task)">
                <span class="material-symbols-outlined">more_vert</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    task: {
        id: number | string;
        title: string;
        project?: string | null;
        priority: number;
        tagColor: string;
        duration: string;
    }
}>();

defineEmits(['start', 'edit', 'more']);
</script>

<style scoped>
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
    margin: 0.25rem 0 0 0;
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
