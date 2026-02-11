<template>
    <div v-if="isOpen && task" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-card shadow-2xl">
            <div class="modal-header">
                <div class="header-content">
                    <div class="category-status">
                        <span class="category-tag">{{ task.category }}</span>
                        <span v-if="task.status !== 'pending'" class="status-badge-modal" :class="task.status">
                            {{ getStatusLabel(task.status) }}
                        </span>
                    </div>
                    <h2>Detalles de la Tarea</h2>
                </div>
                <button class="close-btn" @click="$emit('close')">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div class="modal-body">
                <div class="detail-header">
                    <h1 class="task-title">{{ task.title }}</h1>
                    <div class="project-info" v-if="task.project">
                        <span class="material-symbols-outlined">folder</span>
                        <span>{{ task.project }}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <label>Descripción</label>
                    <div class="description-content" v-if="task.description">
                        {{ task.description }}
                    </div>
                    <div class="description-empty" v-else>
                        Sin descripción adicional.
                    </div>
                </div>

                <div class="detail-grid">
                    <div class="grid-item">
                        <label>Programado para</label>
                        <div class="item-value">
                            <span class="material-symbols-outlined">calendar_today</span>
                            {{ formatDate(task.scheduledAt) }}
                        </div>
                    </div>
                    <div class="grid-item">
                        <label>Hora</label>
                        <div class="item-value">
                            <span class="material-symbols-outlined">schedule</span>
                            {{ formatTime(task.scheduledAt) }}
                        </div>
                    </div>
                    <div class="grid-item">
                        <label>Prioridad</label>
                        <div class="priority-badges">
                            <span v-for="i in 3" :key="i" class="material-symbols-outlined bolt-icon"
                                :class="{ filled: i <= task.priority }">
                                bolt
                            </span>
                        </div>
                    </div>
                    <div class="grid-item">
                        <label>Duración</label>
                        <div class="item-value">
                            <span class="material-symbols-outlined">timer</span>
                            {{ task.duration }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <div class="footer-actions">
                    <button class="btn-action start-stop" :class="{ 'stop': task.status === 'in-progress' }"
                        @click="handleAction">
                        <span class="material-symbols-outlined">{{ task.status === 'in-progress' ? 'stop' : 'play_arrow'
                            }}</span>
                        {{ task.status === 'in-progress' ? 'Detener' : 'Iniciar' }}
                    </button>

                    <button class="btn-action complete" @click="$emit('complete', task)">
                        <span class="material-symbols-outlined">check_circle</span>
                        Realizada
                    </button>

                    <button class="btn-action cancel" @click="$emit('cancel', task)">
                        <span class="material-symbols-outlined">cancel</span>
                        Cancelar
                    </button>

                    <button class="btn-edit" @click="$emit('edit', task)">
                        <span class="material-symbols-outlined">edit</span>
                        Editar
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

const emit = defineEmits(['close', 'edit', 'start', 'stop', 'complete', 'cancel']);

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'in-progress': return 'Tarea Iniciada';
        case 'completed': return 'Realizada';
        case 'cancelled': return 'Cancelada';
        default: return '';
    }
};

const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
};

const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
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
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 2100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.modal-card {
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    border-radius: 28px;
    width: 100%;
    max-width: 550px;
    max-height: 90vh;
    overflow-y: auto;
    animation: modalIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

@keyframes modalIn {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(20px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.modal-header {
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid var(--glass-border);
}

.category-status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
}

.category-tag {
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--accent-primary);
    background: var(--glow);
    padding: 2px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    display: inline-block;
}

.status-badge-modal {
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 6px;
    letter-spacing: 0.05em;
}

.status-badge-modal.in-progress {
    background: var(--glow);
    color: var(--accent-primary);
    border: 1px solid var(--accent-primary);
}

.status-badge-modal.completed {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border: 1px solid #10b981;
}

.status-badge-modal.cancelled {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid #ef4444;
}

.modal-header h2 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-tertiary);
    margin: 0;
}

.close-btn {
    background: var(--bg-tertiary);
    border: none;
    color: var(--text-secondary);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.modal-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.task-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;
}

.project-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: 0.75rem;
}

.detail-section label {
    display: block;
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--text-tertiary);
    text-transform: uppercase;
    margin-bottom: 0.75rem;
}

.description-content {
    background: var(--bg-tertiary);
    border-radius: 16px;
    padding: 1.25rem;
    color: var(--text-primary);
    font-size: 1rem;
    line-height: 1.6;
    white-space: pre-wrap;
    border: 1px solid var(--glass-border);
}

.description-empty {
    color: var(--text-tertiary);
    font-style: italic;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
}

.grid-item label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-tertiary);
    margin-bottom: 0.5rem;
}

.item-value {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.95rem;
}

.priority-badges {
    display: flex;
    color: #fbbf24;
}

.bolt-icon {
    font-size: 1.25rem;
    opacity: 0.2;
}

.bolt-icon.filled {
    opacity: 1;
    font-variation-settings: 'FILL' 1;
}

.modal-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--glass-border);
}

.footer-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    width: 100%;
}

.btn-edit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
    padding: 0.85rem;
    border-radius: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-edit:hover {
    background: var(--bg-secondary);
}

.btn-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: 1px solid var(--glass-border);
    padding: 0.85rem;
    border-radius: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-action.start-stop {
    background: var(--accent-primary);
    color: white;
}

.btn-action.start-stop.stop {
    background: #ef4444;
}

.btn-action.complete {
    background: #10b981;
    color: white;
}

.btn-action.cancel {
    background: var(--bg-tertiary);
    color: #ef4444;
    border-color: #ef4444;
}

.btn-action.cancel:hover {
    background: #ef4444;
    color: white;
}

@media (max-width: 480px) {
    .detail-grid {
        grid-template-columns: 1fr;
    }

    .modal-footer {
        padding: 1rem 1.5rem;
    }

    .footer-actions {
        grid-template-columns: 1fr;
    }

    .task-title {
        font-size: 1.5rem;
    }
}
</style>
