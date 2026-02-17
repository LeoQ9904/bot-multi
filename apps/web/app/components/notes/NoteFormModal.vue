<template>
    <BaseModal :show="isOpen" title="Nueva Nota" subtitle="Vista de gestión de nota" icon="note_add"
        @close="$emit('close')">
        <template #top>
            <BaseAiInput v-model="aiPrompt" :loading="landingIa" placeholder="¿Qué quieres que te ayude a crear?"
                @process="handleAIProcess" />
        </template>
        <form @submit.prevent="handleSubmit" class="note-form">
            <div class="form-group">
                <label for="title">Título</label>
                <input id="title" v-model="form.title" type="text" placeholder="Título de la nota" required
                    class="form-input" />
            </div>

            <div class="form-group">
                <label for="content">Contenido</label>
                <textarea id="content" v-model="form.content" placeholder="Escribe algo..." required
                    class="form-textarea" rows="15"></textarea>
            </div>

            <ColorTagSelector v-model="form.tagColor" :available-colors="noteStore.allTagColors"
                label="Color de etiqueta" />

        </form>
        <template #footer>
            <div style="display: flex; justify-content: space-between; gap: 0.5rem;">
                <button type="button" class="btn-secondary" @click="close">Cancelar</button>
                <button @click="handleSubmit" class="btn-primary" :disabled="isSubmitting">
                    {{ isEdit ? 'Guardar Cambios' : 'Crear Nota' }}
                </button>
            </div>
        </template>
    </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Note } from '../../types/note.types';
import { useNoteStore } from '../../stores/note.store';
import ColorTagSelector from '../ui/ColorTagSelector.vue';
import BaseModal from '../ui/BaseModal.vue';
import BaseAiInput from '../ui/BaseAiInput.vue';
import { IaService } from '~/services/ia.service';

const props = defineProps<{
    isOpen: boolean;
    note?: Note | null;
}>();

const emit = defineEmits(['close', 'save']);
const { user } = useFirebaseAuth();
const noteStore = useNoteStore();
const isSubmitting = ref(false);
const aiPrompt = ref('');
const landingIa = ref(false);

const form = ref({
    title: '',
    content: '',
    tagColor: 'blue'
});



const isEdit = computed(() => !!props.note);

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (props.note) {
            form.value = {
                title: props.note.title,
                content: props.note.content,
                tagColor: props.note.tagColor
            };
        } else {
            form.value = {
                title: '',
                content: '',
                tagColor: 'blue'
            };
        }
    }
});

const close = () => {
    emit('close');
};

const handleSubmit = async () => {
    isSubmitting.value = true;
    try {
        emit('save', { ...form.value });
        close();
    } finally {
        isSubmitting.value = false;
    }
};

const handleAIProcess = async () => {
    if (!aiPrompt.value.trim()) return;
    landingIa.value = true;
    try {
        const token = await user.value?.getIdToken();
        if (!token) return;
        const prompt = `
            Eres un asistente de planeación, tu objetivo es ayudar al usuario a crear notas.
            **IMPORTANT**: No crear nota en este proceso en el sistema, solo retornar el siguiente objeto JSON:
            {
                "title": "",
                "content": "",
                "tagColor": ""
            }
            **IMPORTANT**: Ajustar el título y la descripción agregando más contenido y iconos si es necesario.
            **IMPORTANT**: El color de la etiqueta debe ser uno de los siguientes: ${noteStore.allTagColors.join(', ')}
            La información generada por el usuario es:
            ${aiPrompt.value}
        `
        const response = await IaService.chat(prompt, 'main', token);
        const note: Note = JSON.parse(response.data.response);
        form.value = note;
    } catch (error) {
        console.error('Error generating note:', error);
    } finally {
        landingIa.value = false;
        aiPrompt.value = '';
    }
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.modal-content {
    width: 100%;
    max-width: 600px;
    border-radius: 28px;
    padding: 2rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    animation: modal-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modal-in {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.close-btn {
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.close-btn:hover {
    background: var(--bg-primary);
    color: var(--text-primary);
}

.note-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
    padding-left: 0.2rem;
}

.form-input,
.form-textarea {
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    color: var(--text-primary);
    font-size: 1rem;
    transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: var(--accent-primary);
    background: var(--bg-secondary);
}



.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}

.btn-primary {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px rgba(var(--accent-primary-rgb), 0.4);
}

.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--glass-border);
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: var(--bg-secondary);
}

.glass-morphism {
    background: rgba(var(--bg-secondary-rgb, 19, 24, 37), 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
}
</style>
