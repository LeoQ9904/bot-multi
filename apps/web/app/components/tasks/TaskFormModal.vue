<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-card shadow-2xl">
            <div class="modal-header">
                <h2>{{ isEditing ? 'Editar Tarea' : 'Nueva Tarea' }}</h2>
                <button class="close-btn" @click="$emit('close')">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="modal-form">
                <BaseInput id="title" v-model="form.title" label="Título de la Tarea"
                    placeholder="¿Qué tienes planeado hacer?" required />

                <div class="form-row">
                    <BaseInput id="project" v-model="form.project" label="Proyecto" placeholder="Nombre del proyecto"
                        class="flex-1" />
                    <BaseInput id="category" v-model="form.category" label="Categoría" placeholder="Ej: Diseño, Legal"
                        required class="flex-1" />
                </div>

                <div class="form-row">
                    <div class="flex-1">
                        <BaseDateTimePicker label="Programar para" v-model="form.scheduledAt" />
                    </div>

                    <BaseSelect id="priority" v-model.number="form.priority" label="Prioridad" class="flex-1">
                        <option :value="1">Baja</option>
                        <option :value="2">Media</option>
                        <option :value="3">Alta</option>
                    </BaseSelect>
                </div>

                <BaseInput id="duration" v-model="form.duration" label="Duración Estimada" placeholder="Ej: 30 min, 2h"
                    required />

                <BaseTextarea id="description" v-model="form.description" label="Descripción"
                    placeholder="Detalles adicionales de la tarea..." :rows="3" />

                <ColorTagSelector v-model="form.tagColor" :available-colors="taskStore.allTagColors"
                    label="Color de etiqueta" />

                <div class="modal-footer">
                    <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
                    <button type="submit" class="btn-submit">
                        {{ isEditing ? 'Guardar Cambios' : 'Crear Tarea' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseInput from '../ui/BaseInput.vue';
import BaseSelect from '../ui/BaseSelect.vue';
import BaseTextarea from '../ui/BaseTextarea.vue';
import BaseDateTimePicker from '../ui/BaseDateTimePicker.vue';
import ColorTagSelector from '../ui/ColorTagSelector.vue';
import { useTaskStore } from '../../stores/task.store';


const props = defineProps<{
    isOpen: boolean;
    initialData?: any;
}>();

const emit = defineEmits(['close', 'save']);
const taskStore = useTaskStore();
const isEditing = ref(false);

const defaultForm = {
    title: '',
    project: '',
    category: '',
    description: '',
    duration: '30 min',
    scheduledAt: Date.now() + 3600000, // Default to 1h from now
    priority: 2,
    tagColor: 'emerald'
};

const form = ref({ ...defaultForm });

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (props.initialData) {
            form.value = { ...props.initialData };
            isEditing.value = true;
        } else {
            form.value = { ...defaultForm, scheduledAt: Date.now() + 3600000 };
            isEditing.value = false;
        }
    }
});

const handleSubmit = () => {
    emit('save', { ...form.value });
};

</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.modal-card {
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    animation: modalIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

@keyframes modalIn {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
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
    align-items: center;
    border-bottom: 1px solid var(--glass-border);
}

.modal-header h2 {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-primary);
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

.modal-form {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-row {
    display: flex;
    gap: 1rem;
}

label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-tertiary);
}

.color-picker {
    display: flex;
    gap: 1rem;
}

.color-option {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 4px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
}

.color-option.red {
    background: #ef4444;
}

.color-option.amber {
    background: #f59e0b;
}

.color-option.emerald {
    background: #10b981;
}

.color-option.active {
    border-color: white;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.btn-cancel {
    flex: 1;
    background: transparent;
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    padding: 0.75rem;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
}

.btn-submit {
    flex: 2;
    background: var(--accent-primary);
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px var(--glow);
}

.flex-1 {
    flex: 1;
}

@media (max-width: 480px) {
    .form-row {
        flex-direction: column;
    }
}
</style>
