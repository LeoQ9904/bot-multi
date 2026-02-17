<template>
    <BaseModal :show="isOpen" :title="isEditing ? 'Editar Tarea' : 'Nueva Tarea'" subtitle="PANEL DE CREACIÓN AVANZADA"
        icon="add_task" @close="$emit('close')">
        <!-- AI Magic Input -->
        <template #top v-if="!isEditing">
            <div class="ai-section">
                <div class="ai-gradient-border">
                    <div class="ai-input-container">
                        <span class="material-symbols-outlined ai-icon">auto_awesome</span>
                        <input v-model="aiPrompt" class="ai-input"
                            placeholder="Dime qué necesitas hacer... (ej: Preparar reporte mensual mañana a las 11:00)"
                            type="text" :disabled="landingIa" />
                        <button @click="handleAIProcess" class="ai-btn" :disabled="landingIa">
                            <template v-if="landingIa">
                                <Loader size="sm" color="white" />
                            </template>
                            <template v-else>
                                <span class="not-view-text-movil">Procesar</span>
                                <span class="material-symbols-outlined">bolt</span>
                            </template>
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <!-- Form Body (Inner scrolling part) -->
        <form @submit.prevent="handleSubmit" class="modal-form-content">
            <div class="form-grid">
                <!-- Left Column -->
                <div class="column-left">
                    <section class="form-section">
                        <div class="section-header">
                            <span class="step-number step-1">1</span>
                            <h3 style="width: 100%;">¿QUÉ VAS A HACER?</h3>
                        </div>
                        <div class="section-body">
                            <BaseInput v-model="form.title" label="Título de la Tarea"
                                placeholder="Ej: Rediseñar flujo de checkout" class="input-title" required />
                            <div class="row-2-col">
                                <BaseInput v-model="form.project" label="Proyecto" placeholder="Ej: Raya Redesign" />
                                <BaseInput v-model="form.category" label="Categoría" placeholder="Ej: Diseño, Legal..."
                                    required />
                            </div>
                        </div>
                    </section>

                    <section class="form-section">
                        <div class="section-header">
                            <span class="step-number step-2">2</span>
                            <h3>DETALLES ADICIONALES</h3>
                        </div>
                        <div class="section-body">
                            <BaseTextarea v-model="form.description" label="Descripción"
                                placeholder="Escribe notas, enlaces o contexto importante..." :rows="6" />
                            <ColorTagSelector v-model="form.tagColor" :available-colors="taskStore.allTagColors"
                                label="Etiqueta de Color" />
                        </div>
                    </section>
                </div>

                <!-- Right Column -->
                <div class="column-right">
                    <section class="form-section">
                        <div class="section-header">
                            <span class="step-number step-3">3</span>
                            <h3>CUÁNDO Y CUÁNTO</h3>
                        </div>
                        <div class="section-body space-y-large">
                            <div class="field-group">
                                <BaseDateTimePicker v-model="form.scheduledAt" label="Programación" />
                            </div>

                            <div class="row-2-col">
                                <div class="field-group">
                                    <label class="base-label"><span
                                            class="material-symbols-outlined small-icon">priority_high</span>
                                        Prioridad</label>
                                    <div class="pill-group">
                                        <button type="button" class="pill-btn priority-high"
                                            :class="{ active: form.priority === 3 }"
                                            @click="form.priority = 3">ALTA</button>
                                        <button type="button" class="pill-btn priority-mid"
                                            :class="{ active: form.priority === 2 }"
                                            @click="form.priority = 2">MEDIA</button>
                                        <button type="button" class="pill-btn priority-low"
                                            :class="{ active: form.priority === 1 }"
                                            @click="form.priority = 1">BAJA</button>
                                    </div>
                                </div>
                            </div>

                            <div class="field-group">
                                <label class="base-label">Duración Estimada</label>
                                <div class="duration-control">
                                    <span class="material-symbols-outlined icon-timer">timer</span>
                                    <div class="counter-wrapper">
                                        <button type="button" class="counter-btn" @click="decrementDuration"><span
                                                class="material-symbols-outlined">remove</span></button>
                                        <div class="counter-display">
                                            <input :value="durationValue" @input="handleDurationChange"
                                                class="duration-input" type="text" />
                                            <span class="unit">minutos</span>
                                        </div>
                                        <button type="button" class="counter-btn" @click="incrementDuration"><span
                                                class="material-symbols-outlined">add</span></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </form>

        <template #footer>
            <div style="display: flex; justify-content: space-between; gap: 0.5rem;">
                <button class="btn-cancel" @click="$emit('close')">Cancelar</button>
                <button class="btn-submit" @click="handleSubmit">
                    <span class="material-symbols-outlined">{{ isEditing ? 'save' : 'rocket_launch' }}</span>
                    {{ isEditing ? 'Guardar Cambios' : 'Crear Tarea' }}
                </button>
            </div>
        </template>
    </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import BaseModal from '../ui/BaseModal.vue';
import BaseInput from '../ui/BaseInput.vue';
import BaseTextarea from '../ui/BaseTextarea.vue';
import BaseDateTimePicker from '../ui/BaseDateTimePicker.vue';
import ColorTagSelector from '../ui/ColorTagSelector.vue';
import { useTaskStore } from '../../stores/task.store';
import { IaService } from '~/services/ia.service';
import Loader from '../icons/Loader.vue';
import { useFirebaseAuth } from '../../composables/useAuth';

const props = defineProps<{
    isOpen: boolean;
    initialData?: any;
}>();

const { user } = useFirebaseAuth();
const emit = defineEmits(['close', 'save']);
const taskStore = useTaskStore();
const isEditing = ref(false);
const aiPrompt = ref('');
const landingIa = ref(false);

const defaultForm = {
    title: '',
    project: '',
    category: '',
    description: '',
    duration: '30 min',
    scheduledAt: Date.now() + 3600000,
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
        aiPrompt.value = '';
    }
});

const handleSubmit = () => {
    emit('save', { ...form.value });
};

const handleAIProcess = async () => {
    console.log('AI Processing:', aiPrompt.value);
    try {
        const token = await user.value?.getIdToken();
        const promtp = `
            Este es el listado de tagColor disponibles: 
            ${taskStore.allTagColors}
            Esto es lo que quiero: ${aiPrompt.value}
        `;
        landingIa.value = true;
        const response = await IaService.postTasks(promtp, 'main', new Date().toISOString(), token || '');
        if (response.data && response.data.task) {
            form.value = { ...response.data.task };
            durationValue.value = response.data.task.duration;
        }
        landingIa.value = false;
    } catch (error) {
        console.log(`Error al procesar la tarea: ${error}`);
        landingIa.value = false;
    }
};

const durationValue = computed({
    get: (): string => {
        const d = form.value.duration || '30';
        const m = d.match(/(\d+)/);
        return (m && m[1]) ? m[1] : '30';
    },
    set: (val: string) => {
        form.value.duration = `${val} min`;
    }
});

const incrementDuration = () => {
    const current = parseInt(durationValue.value) || 0;
    durationValue.value = (current + 15).toString();
};

const decrementDuration = () => {
    const current = parseInt(durationValue.value) || 0;
    durationValue.value = Math.max(5, current - 15).toString();
};

const handleDurationChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    durationValue.value = target.value.replace(/\D/g, '');
};
</script>

<style scoped>
/* AI Section */
.ai-section {
    padding: 1rem;
    /* Adjusted since BaseModal gives side padding */
}

/* ...rest of existing styles, but removing .modal-overlay, .modal-content, .modal-header, .modal-footer, .close-btn, .custom-scrollbar and media queries already handled by BaseModal... */
.ai-gradient-border {
    position: relative;
    background: var(--bg-tertiary);
    border-radius: 16px;
    padding: 1px;
}

.ai-gradient-border::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-purple), var(--accent-tertiary));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
}

.ai-input-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: var(--bg-secondary);
    border-radius: 15px;
    position: relative;
    z-index: 1;
}

.ai-icon {
    font-size: 1.5rem;
    color: var(--accent-primary);
}

.ai-input {
    flex: 1;
    background: transparent;
    border: none;
    font-size: 1.125rem;
    color: var(--text-primary);
    outline: none;
}

.ai-input::placeholder {
    color: var(--text-tertiary);
}

.ai-btn {
    padding: 0.625rem 1.5rem;
    background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary));
    color: white;
    font-size: 0.875rem;
    font-weight: 700;
    border-radius: 0.75rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 10px 15px -3px var(--glow);
    transition: all 0.2s;
}

.ai-btn:hover {
    filter: brightness(1.1);
}

/* Form Layout */
.form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
}

@media (min-width: 1024px) {
    .form-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.step-number {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
    margin: 0 !important;
}

.step-1 {
    background: var(--glass-bg);
    color: var(--accent-primary);
    border: 1px solid var(--glass-border);
}

.step-2 {
    background: var(--glass-bg);
    color: var(--accent-purple);
    border: 1px solid var(--glass-border);
}

.step-3 {
    background: var(--glass-bg);
    color: var(--accent-tertiary);
    border: 1px solid var(--glass-border);
}

.section-header h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
}

.section-body {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.row-2-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

/* Custom Component Overrides */
:deep(.base-input),
:deep(.base-select),
:deep(.base-textarea),
:deep(.dp__input) {
    background: var(--bg-tertiary) !important;
    border-color: var(--glass-border) !important;
    color: var(--text-primary) !important;
    border-radius: 1rem !important;
}

:deep(.base-input:focus),
:deep(.base-select:focus),
:deep(.base-textarea:focus),
:deep(.dp__input:focus) {
    border-color: var(--accent-primary) !important;
    box-shadow: 0 0 0 2px var(--glow) !important;
}

:deep(.input-title .base-input) {
    font-size: 1.125rem !important;
    padding: 0.75rem 1rem !important;
}

/* Pill Groups */
.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.base-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.small-icon {
    font-size: 0.875rem;
}

.pill-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
}

.pill-btn {
    padding: 0.75rem;
    border-radius: 0.75rem;
    border: 1px solid var(--glass-border);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}

/* Priority Colors */
.priority-high.active {
    border-color: var(--accent-red);
    background: rgba(var(--bg-tertiary-rgb), 0.1);
    color: var(--accent-red);
}

.priority-mid.active {
    border-color: var(--accent-primary);
    background: rgba(var(--bg-tertiary-rgb), 0.1);
    color: var(--accent-primary);
}

.priority-low.active {
    border-color: var(--accent-emerald);
    background: rgba(var(--bg-tertiary-rgb), 0.1);
    color: var(--accent-emerald);
}

.pill-btn:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

/* Duration Control */
.duration-control {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--bg-tertiary);
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid var(--glass-border);
}

.icon-timer {
    color: var(--accent-primary);
}

.counter-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.counter-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--glass-border);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.counter-btn:hover {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
}

.counter-display {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.duration-input {
    width: 3rem;
    background: transparent;
    border: none;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    font-family: monospace;
    outline: none;
}

.unit {
    color: var(--text-tertiary);
    font-weight: 500;
}

/* Footer Buttons */
.btn-cancel {
    padding: 0.875rem 2rem;
    border-radius: 1rem;
    background: transparent;
    color: var(--text-secondary);
    font-weight: 700;
    border: 1px solid var(--glass-border);
    cursor: pointer;
    transition: all 0.2s;
}

.btn-cancel:hover {
    background: var(--glass-bg);
    color: var(--text-primary);
}

.btn-submit {
    padding: 0.875rem 2.5rem;
    border-radius: 1rem;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: white;
    font-weight: 700;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 4px 12px var(--glow);
    transition: all 0.2s;
}

.btn-submit:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px var(--glow);
}

@media (max-width: 768px) {
    .ai-btn {
        padding: 0.5rem 0.8rem;
    }

    .form-grid {
        gap: 0.5rem;
    }

    .form-section {
        gap: 0.5rem;
    }

    .not-view-text-movil {
        display: none;
    }
}
</style>
