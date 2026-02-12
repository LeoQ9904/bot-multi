<template>
    <section class="dashboard-section recent-tasks-section">
        <div class="section-header">
            <h3 class="section-title-dashboard">Plan de Hoy</h3>
            <NuxtLink to="/task" class="view-all-btn">Ver lista completa</NuxtLink>
        </div>

        <div class="tasks-grid">
            <!-- Main Focus Task (High Priority or In Progress) -->
            <div v-if="mainFocusTask" class="main-focus-card glass-panel" @click="$emit('preview', mainFocusTask)">
                <div class="focus-content">
                    <div class="focus-meta">
                        <span class="focus-badge">Prioridad Máxima</span>
                        <span class="focus-time" v-if="mainFocusTask.duration">• {{ mainFocusTask.duration }}</span>
                    </div>
                    <h4 class="focus-title">{{ mainFocusTask.title }}</h4>
                    <p class="focus-desc">{{ mainFocusTask.description || 'Sin descripción' }}</p>

                    <div class="focus-actions">
                        <button v-if="mainFocusTask.status !== 'in-progress'" class="btn-primary start-btn"
                            @click.stop="$emit('start', mainFocusTask)">
                            <span class="material-symbols-outlined">play_arrow</span>
                            <span>Empezar sesión</span>
                        </button>
                        <button v-else class="btn-primary stop-btn" @click.stop="$emit('stop', mainFocusTask)">
                            <span class="material-symbols-outlined">pause</span>
                            <span>Pausar</span>
                        </button>
                    </div>
                </div>

                <div class="focus-visual">
                    <div class="visual-content">
                        <span class="material-symbols-outlined visual-icon">analytics</span>
                        <p class="visual-label">Contexto AI</p>
                    </div>
                </div>
            </div>

            <div v-for="task in secondaryTasks" :key="task.id" class="secondary-task-card glass-panel"
                @click="$emit('preview', task)">
                <div class="secondary-header">
                    <div class="task-info-left">
                        <div class="task-icon-wrapper" :class="getCategoryColorClass(task.category)">
                            <span class="material-symbols-outlined">{{ getCategoryIcon(task.category) }}</span>
                        </div>
                        <div class="task-badges">
                            <span class="task-tag-dot" :style="{ backgroundColor: getTagColor(task.tagColor) }"
                                :title="task.tagColor"></span>
                            <span v-if="task.status === 'in-progress'" class="status-badge running">
                                <span class="material-symbols-outlined text-xs">play_arrow</span> En curso
                            </span>
                        </div>
                    </div>

                    <div class="secondary-actions" @click.stop>
                        <button v-if="task.status !== 'in-progress' && task.status !== 'completed'"
                            class="action-btn-mini start" @click="$emit('start', task)" title="Iniciar">
                            <span class="material-symbols-outlined">play_arrow</span>
                        </button>
                        <button v-if="task.status === 'in-progress'" class="action-btn-mini pause"
                            @click="$emit('stop', task)" title="Pausar">
                            <span class="material-symbols-outlined">pause</span>
                        </button>
                        <button v-if="task.status !== 'completed'" class="action-btn-mini complete"
                            @click="$emit('complete', task)" title="Completar">
                            <span class="material-symbols-outlined">check</span>
                        </button>
                    </div>
                </div>
                <div class="secondary-body">
                    <h5 class="secondary-title" :class="{ 'completed': task.status === 'completed' }">{{ task.title }}
                    </h5>
                    <p class="secondary-desc">{{ task.description || 'Sin descripción' }}</p>
                </div>
            </div>

            <!-- Empty State if no tasks -->
            <div v-if="!mainFocusTask && secondaryTasks.length === 0" class="empty-dashboard-tasks glass-panel">
                <span class="material-symbols-outlined">task_alt</span>
                <p>¡No tienes tareas pendientes para hoy!</p>
                <button class="btn-text" @click="$emit('create')">Crear tarea</button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { Task } from '~/types/task.types';
import { computed } from 'vue';

const props = defineProps<{
    tasks: Task[];
}>();

defineEmits(['start', 'stop', 'preview', 'create', 'complete']);

const mainFocusTask = computed(() => {
    // Priority: In Progress -> High Priority -> First available
    const inProgress = props.tasks.find(t => t.status === 'in-progress');
    if (inProgress) return inProgress;

    // Assuming we might have priority field later, for now just take the first one
    return props.tasks[0];
});

const secondaryTasks = computed(() => {
    if (!mainFocusTask.value) return [];
    return props.tasks.filter(t => t.id !== mainFocusTask.value!.id).slice(0, 2);
});

const getCategoryIcon = (category?: string) => {
    switch (category) {
        case 'work': return 'work';
        case 'personal': return 'person';
        case 'health': return 'fitness_center';
        default: return 'task';
    }
};

const getCategoryColorClass = (category?: string) => {
    switch (category) {
        case 'work': return 'icon-blue';
        case 'personal': return 'icon-purple';
        case 'health': return 'icon-emerald';
        default: return 'icon-default';
    }
}

const getTagColor = (colorName: string) => {
    const colors: Record<string, string> = {
        'blue': '#3b82f6',
        'purple': '#a855f7',
        'emerald': '#10b981',
        'amber': '#f59e0b',
        'red': '#ef4444',
        'gray': '#9ca3af',
        'pink': '#ec4899',
        'indigo': '#6366f1'
    };
    return colors[colorName] || colorName || '#9ca3af';
};
</script>

<style scoped>
.dashboard-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-title-dashboard {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
}

.view-all-btn {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--accent-primary);
    text-decoration: none;
    transition: color 0.2s;
}

.view-all-btn:hover {
    color: var(--accent-secondary);
}

.tasks-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

@media (min-width: 768px) {
    .tasks-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .main-focus-card {
        grid-column: span 2;
    }
}

.glass-panel {
    background: var(--bg-tertiary);
    /* Fallback or specific bg */
    background: rgba(var(--bg-secondary-rgb, 19, 24, 37), 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;
}

.glass-panel:hover {
    border-color: var(--accent-primary);
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Main Focus Card */
.main-focus-card {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    position: relative;
    overflow: hidden;
    padding: 2rem;
}

@media (min-width: 768px) {
    .main-focus-card {
        flex-direction: row;
        align-items: center;
    }
}

.focus-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.focus-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.focus-badge {
    background: rgba(var(--accent-primary-rgb), 0.1);
    /* fallback */
    background: rgba(102, 126, 234, 0.1);
    color: var(--accent-primary);
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.focus-time {
    font-size: 0.8rem;
    color: var(--text-tertiary);
}

.focus-title {
    font-size: 1.75rem;
    font-weight: 800;
    line-height: 1.2;
    color: var(--text-primary);
}

.focus-desc {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.start-btn,
.stop-btn {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 700;
    margin-top: 0.5rem;
}

.focus-visual {
    width: 100%;
    height: 150px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px dashed var(--glass-border);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

@media (min-width: 768px) {
    .focus-visual {
        width: 180px;
        /* w-48 */
        height: 180px;
        /* h-48 */
    }
}

.visual-content {
    text-align: center;
}

.visual-icon {
    font-size: 2.5rem;
    color: var(--accent-primary);
    margin-bottom: 0.5rem;
}

.visual-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-tertiary);
    text-transform: uppercase;
}

/* Secondary Task Cards */
.secondary-task-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.secondary-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.task-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-blue {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
}

.icon-purple {
    background: rgba(168, 85, 247, 0.1);
    color: #a855f7;
}

.icon-emerald {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
}

.icon-default {
    background: rgba(148, 163, 184, 0.1);
    color: #94a3b8;
}

.status-indicator span {
    font-size: 1.5rem;
    color: var(--glass-border);
    transition: color 0.2s;
}

.secondary-task-card:hover .status-indicator span {
    color: var(--accent-primary);
}

.secondary-title {
    font-weight: 700;
    color: var(--text-primary);
    font-size: 1.1rem;
}

.secondary-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.empty-dashboard-tasks {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    text-align: center;
    padding: 3rem;
}

.empty-dashboard-tasks .material-symbols-outlined {
    font-size: 3rem;
    color: var(--text-tertiary);
}

.btn-text {
    background: none;
    border: none;
    color: var(--accent-primary);
    font-weight: 600;
    cursor: pointer;
}

.task-info-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.task-badges {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.task-tag-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: block;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.status-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
    border-radius: 100px;
    font-weight: 700;
    text-transform: uppercase;
}

.status-badge.running {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.2);
}

.secondary-actions {
    display: flex;
    gap: 0.25rem;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.glass-panel:hover .secondary-actions {
    opacity: 1;
}

.action-btn-mini {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn-mini:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    transform: scale(1.05);
}

.action-btn-mini.start:hover {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border-color: rgba(16, 185, 129, 0.2);
}

.action-btn-mini.pause:hover {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border-color: rgba(245, 158, 11, 0.2);
}

.action-btn-mini.complete:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    border-color: rgba(59, 130, 246, 0.2);
}

.action-btn-mini .material-symbols-outlined {
    font-size: 1.1rem;
}

.secondary-title.completed {
    text-decoration: line-through;
    color: var(--text-tertiary);
}

.text-xs {
    font-size: 0.9rem;
}

/* Mobile: always show actions */
@media (max-width: 768px) {
    .secondary-actions {
        opacity: 1;
    }
}
</style>
