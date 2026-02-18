<template>
    <section class="dashboard-section recent-tasks-section">
        <div class="section-header">
            <div class="header-left">
                <h3 class="section-title-dashboard">Plan de Hoy</h3>
                <div class="header-stats">
                    <span class="stat-item">
                        <span class="material-symbols-outlined">task_alt</span>
                        {{ completedTasksCount }}/{{ totalTasksToday }}
                    </span>
                    <span class="stat-item">
                        <span class="material-symbols-outlined">schedule</span>
                        {{ totalTimeToday }}
                    </span>
                </div>
            </div>
            <NuxtLink to="/task" class="view-all-btn">
                <span>Ver todas</span>
                <span class="material-symbols-outlined">arrow_forward</span>
            </NuxtLink>
        </div>

        <div class="tasks-grid">
            <!-- Main Focus Task -->
            <div v-if="mainFocusTask" class="main-focus-card glass-panel" @click="openViewTask(mainFocusTask.id)">
                <div class="focus-glow" :class="getProjectColorClass(mainFocusTask.project)"></div>

                <div class="focus-content">
                    <div class="focus-meta">
                        <span class="focus-badge" :style="{ color: mainFocusTask.tagColor }">
                            <span class="material-symbols-outlined">{{ getStatusIcon(mainFocusTask.status) }}</span>
                            {{ getStatusLabel(mainFocusTask.status) }}
                        </span>
                        <span class="project-tag" v-if="mainFocusTask.project">
                            {{ mainFocusTask.project }}
                        </span>
                    </div>

                    <h4 class="focus-title">{{ mainFocusTask.title }}</h4>
                    <p class="focus-desc" v-if="mainFocusTask.description">
                        {{ mainFocusTask.description }}
                    </p>

                    <div class="focus-details">
                        <div class="detail-item" v-if="mainFocusTask.category">
                            <span class="material-symbols-outlined">{{ getCategoryIcon(mainFocusTask.category) }}</span>
                            <span>{{ mainFocusTask.category }}</span>
                        </div>
                        <div class="detail-item" v-if="mainFocusTask.duration">
                            <span class="material-symbols-outlined">timer</span>
                            <span>{{ mainFocusTask.duration }}</span>
                        </div>
                        <div class="detail-item" v-if="mainFocusTask.scheduledAt">
                            <span class="material-symbols-outlined">schedule</span>
                            <span>{{ formatTime(mainFocusTask.scheduledAt) }}</span>
                        </div>
                    </div>

                    <div class="focus-actions">
                        <button v-if="mainFocusTask.status === 'pending'" class="btn-primary start-btn"
                            @click.stop="handleStart(mainFocusTask.id)">
                            <span class="material-symbols-outlined">play_arrow</span>
                            <span>Empezar ahora</span>
                        </button>
                        <button v-else-if="mainFocusTask.status === 'in-progress'" class="btn-primary pause-btn"
                            @click.stop="handleStop(mainFocusTask.id)">
                            <span class="material-symbols-outlined">pause</span>
                            <span>Pausar</span>
                        </button>
                        <button v-if="mainFocusTask.status !== 'completed'" class="action-btn-mini complete"
                            @click.stop="handleComplete(mainFocusTask.id)" title="Completar">
                            <span class="material-symbols-outlined">check</span>
                        </button>

                        <button class="btn-secondary" @click.stop="openViewTask(mainFocusTask.id)">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                    </div>
                </div>

                <div class="focus-visual" :class="getProjectColorClass(mainFocusTask.project)">
                    <div class="visual-content">
                        <div class="project-icon">
                            <span class="material-symbols-outlined">{{ getProjectIcon(mainFocusTask.project) }}</span>
                        </div>
                        <div class="visual-stats">
                            <div class="stat">
                                <span class="stat-value">{{ mainFocusTask.priority }}</span>
                                <span class="stat-label">Prioridad</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Secondary Task Cards -->
            <TaskCard v-for="task in secondaryTasks" :key="task.id" :task="task" @start="handleStart(task.id)"
                @stop="handleStop(task.id)" @complete="handleComplete(task.id)" @cancel="handleCancel(task.id)"
                @edit="openEditTask(task.id)" @more="handleDelete(task.id)" @preview="openViewTask(task.id)" />

            <!-- Empty State -->
            <div v-if="!mainFocusTask && secondaryTasks.length === 0" class="empty-dashboard-tasks glass-panel">
                <div class="empty-icon">
                    <span class="material-symbols-outlined">task_alt</span>
                </div>
                <h4 class="empty-title">¡Todo listo por hoy!</h4>
                <p class="empty-desc">No tienes tareas pendientes. Aprovecha para planificar o descansar.</p>
                <button class="btn-primary" @click="openNewTask">
                    <span class="material-symbols-outlined">add</span>
                    <span>Crear nueva tarea</span>
                </button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { Task } from '~/types/task.types';
import { computed } from 'vue';
import { useTaskActions } from '~/composables/useTaskActions';
import TaskCard from '~/components/tasks/TaskCard.vue';

const {
    openNewTask,
    openEditTask,
    openViewTask,
    handleStart,
    handleStop,
    handleComplete,
    handleCancel,
    handleDelete
} = useTaskActions();

const props = defineProps<{
    tasks: Task[];
}>();

// Emits are no longer needed for task actions as they are handled internally
// defineEmits(['start', 'stop', 'preview', 'create', 'complete']);

const mainFocusTask = computed(() => {
    const inProgress = props.tasks.find(t => t.status === 'in-progress');
    if (inProgress) return inProgress;

    const pending = props.tasks.filter(t => t.status === 'pending');
    if (pending.length === 0) return props.tasks[0];

    // Priorizar por priority desc
    return pending.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
});

const secondaryTasks = computed(() => {
    if (!mainFocusTask.value) return props.tasks.slice(0, 4);
    return props.tasks
        .filter(t => t.id !== mainFocusTask.value!.id)
        .slice(0, 4);
});

const completedTasksCount = computed(() =>
    props.tasks.filter(t => t.status === 'completed').length
);

const totalTasksToday = computed(() => props.tasks.length);

const totalTimeToday = computed(() => {
    const total = props.tasks.reduce((acc, task) => {
        if (!task.duration) return acc;
        const match = task.duration.match(/(\d+)\s*(h|min)/i);
        if (match && match[1] && match[2]) {
            const value = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            return acc + (unit === 'h' ? value * 60 : value);
        }
        return acc;
    }, 0);

    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
});

const getProjectColorClass = (project?: string | null) => {
    const colors: Record<string, string> = {
        'Aether': 'project-aether',
        'Nebula': 'project-nebula'
    };
    return colors[project || ''] || '';
};

const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
        'pending': 'radio_button_unchecked',
        'in-progress': 'play_circle',
        'completed': 'check_circle',
        'paused': 'pause_circle'
    };
    return icons[status] || 'circle';
};

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        'pending': 'Pendiente',
        'in-progress': 'En progreso',
        'completed': 'Completada',
        'paused': 'Pausada'
    };
    return labels[status] || status;
};

const formatTime = (ts: number) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const getCategoryIcon = (category?: string) => {
    const icons: Record<string, string> = {
        'Trabajo': 'work',
        'Sprint 6': 'sprint',
        'Sprint 7': 'sprint',
        'Investigación': 'science',
        'personal': 'person',
        'health': 'fitness_center'
    };
    return icons[category || ''] || 'task';
};

const getProjectIcon = (project?: string | null) => {
    const icons: Record<string, string> = {
        'Aether': 'wb_twilight',
        'Nebula': 'cloud',
        'default': 'folder'
    };
    return icons[project || ''] || icons.default;
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
    flex-wrap: wrap;
    gap: 1rem;
}

.header-left {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.section-title-dashboard {
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
}

.header-stats {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 600;
}

.stat-item .material-symbols-outlined {
    font-size: 1rem;
    color: var(--accent-primary);
}

.view-all-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--accent-primary);
    text-decoration: none;
    transition: all 0.2s;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    background: rgba(var(--accent-primary-rgb, 102, 126, 234), 0.1);
}

.view-all-btn:hover {
    background: rgba(var(--accent-primary-rgb, 102, 126, 234), 0.15);
    transform: translateX(2px);
}

.view-all-btn .material-symbols-outlined {
    font-size: 1.1rem;
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

@media (min-width: 1200px) {
    .tasks-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .main-focus-card {
        grid-column: span 3;
    }
}

.glass-panel {
    position: relative;
    background: rgba(var(--bg-secondary-rgb, 19, 24, 37), 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-radius: 18px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px var(--shadow);
    transition: all 0.3s ease;
    cursor: pointer;
    overflow: hidden;
}

.glass-panel:hover {
    border-color: var(--accent-primary);
    transform: translateY(-3px);
    box-shadow: 0 12px 24px -8px var(--shadow);
}

/* Main Focus Card */
.main-focus-card {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
    min-height: 280px;
}

@media (min-width: 768px) {
    .main-focus-card {
        flex-direction: row;
        align-items: center;
    }
}

.focus-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.05;
    pointer-events: none;
    transition: opacity 0.3s;
}

.main-focus-card:hover .focus-glow {
    opacity: 0.1;
}

.project-aether .focus-glow,
.project-aether {
    background: radial-gradient(circle at 20% 20%, rgba(167, 85, 247, 0.2) 0%, transparent 70%);
}

.project-nebula .focus-glow,
.project-nebula {
    background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
}

.focus-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    z-index: 1;
}

.focus-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.focus-badge {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.35rem 0.75rem;
    border-radius: 100px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.focus-badge .material-symbols-outlined {
    font-size: 0.95rem;
}

.project-tag {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.65rem;
    border-radius: 6px;
    background: var(--glass-bg);
    color: var(--text-secondary);
    border: 1px solid var(--glass-border);
}

.focus-title {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.2;
    color: var(--text-primary);
    margin: 0;
}

.focus-desc {
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.focus-details {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 600;
}

.detail-item .material-symbols-outlined {
    font-size: 1.1rem;
    color: var(--accent-primary);
}

.focus-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    margin-top: 0.5rem;
}

.start-btn,
.pause-btn,
.completed-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 1.75rem;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.95rem;
}

.start-btn {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
}

.pause-btn {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
}

.completed-btn {
    background: var(--glass-bg);
    color: var(--text-tertiary);
    cursor: not-allowed;
}

.btn-secondary {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.focus-visual {
    width: 100%;
    height: 180px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--glass-border);
    z-index: 1;
}

@media (min-width: 768px) {
    .focus-visual {
        width: 200px;
        height: 200px;
    }
}

.visual-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.project-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--glass-bg);
    border: 2px solid var(--glass-border);
}

.project-icon .material-symbols-outlined {
    font-size: 2.5rem;
    color: var(--accent-primary);
}

.visual-stats {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-primary);
}

.stat-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
}

.task-color-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 18px 18px 0 0;
}

.secondary-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}

.task-info-left {
    display: flex;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
}

.task-icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
}

.task-icon-wrapper .material-symbols-outlined {
    font-size: 1.3rem;
    color: var(--accent-primary);
}

.project-aether .task-icon-wrapper {
    background: rgba(167, 85, 247, 0.1);
    border-color: rgba(167, 85, 247, 0.2);
}

.project-aether .task-icon-wrapper .material-symbols-outlined {
    color: #a855f7;
}

.project-nebula .task-icon-wrapper {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.2);
}

.project-nebula .task-icon-wrapper .material-symbols-outlined {
    color: #3b82f6;
}

.task-text-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.secondary-title {
    font-weight: 700;
    color: var(--text-primary);
    font-size: 1rem;
    margin: 0;
    line-height: 1.3;
}

.secondary-title.completed {
    text-decoration: line-through;
    color: var(--text-tertiary);
}

.task-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: var(--text-tertiary);
}

.meta-item {
    font-weight: 600;
}

.meta-item.project {
    color: var(--accent-primary);
}

.meta-separator {
    color: var(--glass-border);
}

.secondary-actions {
    display: flex;
    gap: 0.35rem;
    opacity: 0;
    transition: opacity 0.2s ease;
    flex-shrink: 0;
}

.glass-panel:hover .secondary-actions {
    opacity: 1;
}

.action-btn-mini {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--glass-border);
    background: var(--glass-bg);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn-mini:hover {
    transform: scale(1.08);
}

.action-btn-mini.start {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.2);
    color: #10b981;
}

.action-btn-mini.start:hover {
    background: rgba(16, 185, 129, 0.2);
}

.action-btn-mini.pause {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
}

.action-btn-mini.pause:hover {
    background: rgba(245, 158, 11, 0.2);
}

.action-btn-mini.complete {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
}

.action-btn-mini.complete:hover {
    background: rgba(59, 130, 246, 0.2);
}

.action-btn-mini .material-symbols-outlined {
    font-size: 1.15rem;
}

.secondary-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
}

.task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid var(--glass-border);
}

.footer-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.duration-badge {
    background: var(--glass-bg);
    color: var(--text-tertiary);
}

/* Empty State */
.empty-dashboard-tasks {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    text-align: center;
    padding: 4rem 2rem;
    min-height: 300px;
}

.empty-icon {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: var(--glass-bg);
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-icon .material-symbols-outlined {
    font-size: 3.5rem;
    color: var(--accent-primary);
}

.empty-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
}

.empty-desc {
    font-size: 1rem;
    color: var(--text-secondary);
    max-width: 400px;
    margin: 0;
}

.btn-primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 1.75rem;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: white;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px var(--glow);
}

/* Mobile: always show actions */
@media (max-width: 768px) {
    .secondary-actions {
        opacity: 1;
    }

    .focus-title {
        font-size: 1.5rem;
    }
}
</style>