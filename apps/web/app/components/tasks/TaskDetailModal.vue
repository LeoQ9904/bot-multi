<template>
    <div v-if="isOpen && task" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container glass-panel shadow-2xl">
            <!-- Header -->
            <div class="modal-header">
                <div class="header-left">
                    <div class="header-icon-box">
                        <span class="material-symbols-outlined">task_alt</span>
                    </div>
                    <div class="header-text">
                        <h2 style="color: var(--text-primary);">Detalles de la Tarea</h2>
                        <p class="subtitle">Vista de gestión de tarea</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('close')">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <!-- AI Summary Section -->
            <div class="ai-summary-section" v-if="task.aiSummary || true">
                <div class="ai-summary-border">
                    <div class="ai-summary-content">
                        <div class="ai-icon">
                            <span class="material-symbols-outlined">auto_awesome</span>
                        </div>
                        <div class="ai-text-box">
                            <p class="ai-badge">Resumen de IA</p>
                            <p class="ai-text">
                                Este es el ejemplo del resumen de la tarea, se debe que realizar la integración con el
                                modelo de IA para que genere el resumen de la tarea.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Scrollable Content -->
            <div class="modal-body custom-scrollbar">
                <div class="details-grid">
                    <!-- Left Column: Core Info -->
                    <div class="info-column">
                        <div class="detail-card main-info">
                            <div class="field-group">
                                <span class="field-label">Título</span>
                                <h1 class="task-title">{{ task.title }}</h1>
                            </div>

                            <div class="row-fields">
                                <div class="field-group">
                                    <span class="field-label">Proyecto</span>
                                    <div class="project-pill">
                                        <span class="project-dot"></span>
                                        <p class="project-name">{{ task.project || 'Sin proyecto' }}</p>
                                    </div>
                                </div>
                                <div class="field-group">
                                    <span class="field-label">Categoría</span>
                                    <div class="category-pill">
                                        {{ task.category }}
                                    </div>
                                </div>
                            </div>

                            <div class="field-group description-section">
                                <span class="field-label">Descripción</span>
                                <p class="description-text">
                                    {{ task.description || 'Sin descripción adicional.' }}
                                </p>
                            </div>
                        </div>

                        <!-- Tag Section -->
                        <div class="tag-highlight"
                            :style="{ borderColor: task.tagColor + '33', background: task.tagColor + '0D' }">
                            <div class="tag-line" :style="{ background: task.tagColor }">
                            </div>
                            <div class="tag-content">
                                <p class="field-label-mini">Etiqueta</p>
                                <div
                                    :style="{ backgroundColor: task.tagColor, width: '100%', height: '15px', borderRadius: '999px' }">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Stats & Schedule -->
                    <div class="stats-column">
                        <div class="detail-card stats-card">
                            <div class="stat-row">
                                <span class="material-symbols-outlined stat-icon">calendar_month</span>
                                <div class="stat-info">
                                    <span class="field-label">Programación</span>
                                    <p class="stat-value">{{ formatFullDate(task.scheduledAt) }}</p>
                                </div>
                            </div>

                            <div class="stat-grid-row">
                                <div class="field-group">
                                    <span class="field-label">Prioridad</span>
                                    <div class="priority-pill" :class="'prio-' + task.priority">
                                        {{ getPriorityLabel(task.priority) }}
                                    </div>
                                </div>
                            </div>

                            <div class="duration-section">
                                <div class="duration-header">
                                    <span class="field-label">Duración Estimada</span>
                                    <div class="duration-value">
                                        <span class="material-symbols-outlined duration-icon">timer</span>
                                        <span class="duration-text">{{ task.duration }}</span>
                                    </div>
                                </div>
                                <div class="duration-track">
                                    <div class="duration-fill"
                                        :style="{ width: calculateProgress(task.duration) + '%' }"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Time Ago / Status -->
                        <div class="status-status-card">
                            <div class="status-indicator">
                                <div class="pulse-dot"></div>
                                <span class="status-text">{{ getStatusLabel(task.status) }}</span>
                            </div>
                            <span class="created-ago">Creado hace 2h</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer">
                <div class="footer-left">
                    <button class="action-btn btn-ghost" @click="$emit('edit', task)">
                        <span class="material-symbols-outlined">edit</span>
                        Editar
                    </button>
                    <button class="action-btn btn-ghost-danger" @click="$emit('more', task)">
                        <span class="material-symbols-outlined">delete</span>
                        Eliminar
                    </button>
                </div>
                <div class="footer-right">
                    <button class="action-btn btn-secondary" @click="handleAction">
                        <span class="material-symbols-outlined">
                            {{ task.status === 'in-progress' ? 'pause' : 'play_arrow' }}
                        </span>
                        {{ task.status === 'in-progress' ? 'Pausar' : 'Iniciar' }}
                    </button>
                    <button class="action-btn btn-primary" @click="$emit('complete', task)">
                        <span class="material-symbols-outlined">check_circle</span>
                        Completar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    isOpen: boolean;
    task: any;
}>();

const emit = defineEmits(['close', 'edit', 'start', 'stop', 'complete', 'more']);

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'in-progress': return 'Tarea en curso';
        case 'completed': return 'Realizada';
        case 'cancelled': return 'Cancelada';
        default: return 'Pendiente por iniciar';
    }
};

const getPriorityLabel = (p: number) => {
    if (p >= 3) return 'ALTA';
    if (p === 2) return 'MEDIA';
    return 'BAJA';
};

const formatFullDate = (ts: number) => {
    const date = new Date(ts);
    const day = date.getDate();
    const month = date.toLocaleString('es-ES', { month: 'long' });
    const time = date.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Capitalize month
    const capMonth = month.charAt(0).toUpperCase() + month.slice(1);

    // Check if it's today (simplified)
    const isToday = new Date().toDateString() === date.toDateString();
    const dayPrefix = isToday ? 'Hoy, ' : '';

    return `${dayPrefix}${day} de ${capMonth} • ${time}`;
};

const calculateProgress = (duration: string) => {
    const match = duration.match(/(\d+)/);
    const value = match ? parseInt(match[1]) : 30;
    // Arbitrary progress for visual effect, e.g., max 120 min
    return Math.min(100, (value / 120) * 100);
};

const handleAction = () => {
    if (props.task.status === 'in-progress') {
        emit('stop', props.task);
    } else {
        emit('start', props.task);
    }
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--shadow);
    backdrop-filter: blur(8px);
    z-index: 2100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
}

.modal-container {
    width: 100%;
    max-width: 64rem;
    /* 1024px */
    max-height: 90vh;
    border-radius: 2rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: modalScaleIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

@keyframes modalScaleIn {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.glass-panel {
    background: var(--bg-secondary);
    backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
}

/* Header */
.modal-header {
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(var(--bg-secondary-rgb), 0.4);
    border-bottom: 1px solid var(--glass-border);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-icon-box {
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(var(--accent-primary-rgb), 0.1);
    border: 1px solid rgba(var(--accent-primary-rgb), 0.2);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-primary);
}

.header-text h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
}

.subtitle {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text-tertiary);
    font-weight: 600;
    margin: 2px 0 0;
}

.close-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: all 0.2s;
}

.close-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

/* AI Summary */
.ai-summary-section {
    padding: 1.5rem 2rem 0;
}

.ai-summary-border {
    position: relative;
    padding: 1.5px;
    border-radius: 17px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.5), rgba(192, 132, 252, 0.5), rgba(240, 147, 251, 0.5));
}

.ai-summary-content {
    background: var(--bg-tertiary);
    border-radius: 15px;
    padding: 1rem 1.5rem;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.ai-icon span {
    color: var(--accent-primary);
    font-size: 1.5rem;
}

.ai-badge {
    font-size: 0.65rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    color: var(--accent-primary);
    margin: 0 0 4px;
}

.ai-text {
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
}

/* Body */
.modal-body {
    padding: 2rem;
    flex: 1;
    overflow-y: auto;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
}

@media (max-width: 1024px) {
    .details-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
}

.detail-card {
    background: rgba(var(--bg-tertiary-rgb), 0.4);
    border: 1px solid var(--glass-border);
    border-radius: 1.25rem;
    padding: 1.5rem;
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.field-label {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.15em;
}

.field-label-mini {
    font-size: 0.6rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text-tertiary);
    margin-bottom: 5px;
}

.task-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1.25;
    margin: 0.25rem 0 1.5rem;
}

.row-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.project-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.project-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--accent-primary);
}

.project-name {
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0;
}

.category-pill {
    display: inline-block;
    padding: 0.125rem 0.75rem;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    border-radius: 999px;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.description-section {
    padding-top: 1.5rem;
    border-top: 1px solid var(--glass-border);
}

.description-text {
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0.5rem 0 0;
}

.tag-highlight {
    margin-top: 0.5rem;
    padding: 1rem 1.25rem;
    border-radius: 1rem;
    border-left: 4px solid;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.tag-name {
    font-weight: 700;
    font-size: 0.875rem;
    margin: 0;
}

/* Stats Column */
.stats-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.stats-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.stat-row {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.stat-icon {
    color: var(--accent-primary);
    font-size: 1.5rem;
}

.stat-value {
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.stat-grid-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--glass-border);
}

.priority-pill {
    display: inline-block;
    padding: 0.25rem 1rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 800;
    text-align: center;
}

.prio-3 {
    background: rgba(248, 113, 113, 0.1);
    color: #f87171;
    border: 1px solid rgba(248, 113, 113, 0.3);
}

.prio-2 {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.3);
}

.prio-1 {
    background: rgba(96, 165, 250, 0.1);
    color: #60a5fa;
    border: 1px solid rgba(96, 165, 250, 0.3);
}

.energy-pill {
    display: inline-block;
    padding: 0.25rem 1rem;
    border-radius: 999px;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    color: #fbbf24;
    font-size: 0.7rem;
    font-weight: 800;
    text-align: center;
}

.duration-section {
    padding-top: 1rem;
    border-top: 1px solid var(--glass-border);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.duration-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.duration-value {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--accent-primary);
}

.duration-text {
    font-size: 1.125rem;
    font-weight: 800;
}

.duration-track {
    height: 0.5rem;
    background: var(--bg-tertiary);
    border-radius: 999px;
    overflow: hidden;
}

.duration-fill {
    height: 100%;
    background: var(--accent-primary);
    border-radius: 999px;
}

.status-status-card {
    background: rgba(var(--accent-primary-rgb), 0.05);
    border: 1px solid rgba(var(--accent-primary-rgb), 0.2);
    border-radius: 1.25rem;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.pulse-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--accent-primary);
    box-shadow: 0 0 0 rgba(var(--accent-primary-rgb), 0.4);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(var(--accent-primary-rgb), 0.5);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(var(--accent-primary-rgb), 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(var(--accent-primary-rgb), 0);
    }
}

.status-text {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
}

.created-ago {
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--accent-primary);
    text-transform: uppercase;
}

/* Footer */
.modal-footer {
    padding: 1.5rem 2rem;
    background: rgba(var(--bg-secondary-rgb), 0.8);
    backdrop-filter: blur(24px);
    border-top: 1px solid var(--glass-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
}

@media (max-width: 768px) {
    .modal-footer {
        flex-direction: column;
        gap: 1rem;
    }

    .footer-left,
    .footer-right {
        width: 100%;
        justify-content: center;
    }
}

.footer-left,
.footer-right {
    display: flex;
    gap: 1rem;
}

.action-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 1rem;
    font-weight: 700;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.btn-ghost {
    background: transparent;
    color: var(--text-tertiary);
}

.btn-ghost:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.btn-ghost-danger {
    background: transparent;
    color: rgba(248, 113, 113, 0.7);
}

.btn-ghost-danger:hover {
    background: rgba(248, 113, 113, 0.1);
    color: #f87171;
}

.btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--glass-border);
}

.btn-secondary:hover {
    background: var(--accent-primary);
    color: white;
}

.btn-primary {
    background: var(--accent-primary);
    color: white;
    box-shadow: 0 8px 16px var(--glow);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px var(--glow);
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--bg-tertiary);
    border-radius: 10px;
}

@media (max-width: 768px) {
    .modal-overlay {
        padding: 0.5rem;
    }

    .modal-container {
        max-width: 100%;
        max-height: 100%;
        padding: 0;
    }

    .modal-header {
        padding: 0.5rem 0.8rem;
        border-radius: 0;
    }

    .modal-body {
        padding: 0.5rem 0.8rem;
        border-radius: 0;
    }

    .modal-footer {
        padding: 0.5rem 0.8rem;
        border-radius: 0;
        gap: 0.5rem;
    }

    .details-grid {
        gap: 0.5rem;
    }

    .ai-summary-section {
        padding: 0.5rem 0.8rem;
    }

    .ai-summary-content {
        padding: 0.5rem 0.8rem;
        gap: 0.5rem;
    }
}
</style>
