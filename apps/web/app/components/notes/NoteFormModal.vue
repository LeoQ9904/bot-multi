<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-content glass-morphism">
            <div class="modal-header">
                <h2 class="modal-title">{{ isEdit ? 'Editar Nota' : 'Nueva Nota' }}</h2>
                <button class="close-btn" @click="close">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="note-form">
                <div class="form-group">
                    <label for="title">Título</label>
                    <input id="title" v-model="form.title" type="text" placeholder="Título de la nota" required
                        class="form-input" />
                </div>

                <div class="form-group">
                    <label for="content">Contenido</label>
                    <textarea id="content" v-model="form.content" placeholder="Escribe algo..." required
                        class="form-textarea" rows="6"></textarea>
                </div>

                <div class="form-group">
                    <label>Color de etiqueta</label>
                    <div class="tag-selector">
                        <button v-for="color in allColors" :key="color" type="button" class="tag-btn"
                            :class="{ active: form.tagColor === color }" @click="selectColor(color)">
                            <span class="tag-dot" :style="getColorStyle(color)"></span>
                        </button>

                        <div class="custom-color-wrapper">
                            <input type="color" id="customColor" :value="customColorValue" @input="handleCustomColor"
                                class="color-input">
                            <label for="customColor" class="add-color-btn" title="Color personalizado">
                                <span class="material-symbols-outlined">add</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" @click="close">Cancelar</button>
                    <button type="submit" class="btn-primary" :disabled="isSubmitting">
                        {{ isEdit ? 'Guardar Cambios' : 'Crear Nota' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Note } from '../../types/note.types';
import { useNoteStore, DEFAULT_TAG_COLORS } from '../../stores/note.store';

const props = defineProps<{
    isOpen: boolean;
    note?: Note | null;
}>();

const emit = defineEmits(['close', 'save']);

const noteStore = useNoteStore();
const customColors = ref<string[]>([]);
const isSubmitting = ref(false);

const form = ref({
    title: '',
    content: '',
    tagColor: 'blue'
});

const allColors = computed(() => {
    // Combine store defaults with local custom colors for the form session
    // This allows seeing a just-picked custom color immediately
    const storeColors = noteStore.allTagColors;
    const uniqueCustom = customColors.value.filter(c => !storeColors.includes(c));
    return [...storeColors, ...uniqueCustom];
});
const customColorValue = ref('#000000');

const getColorStyle = (color: string) => {
    if (color.startsWith('#')) {
        return { backgroundColor: color };
    }
    return { backgroundColor: `var(--accent-${color})` };
};

const selectColor = (color: string) => {
    form.value.tagColor = color;
};

const handleCustomColor = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    customColorValue.value = color;

    // Add to custom colors if not already there (limit to recent 5 maybe?)
    if (!customColors.value.includes(color) && !DEFAULT_TAG_COLORS.includes(color)) {
        customColors.value.push(color);
    }
    form.value.tagColor = color;
};

const isEdit = computed(() => !!props.note);

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (props.note) {
            form.value = {
                title: props.note.title,
                content: props.note.content,
                tagColor: props.note.tagColor
            };
            // If the note has a custom color not in defaults, add it to custom list
            if (!DEFAULT_TAG_COLORS.includes(props.note.tagColor) && !customColors.value.includes(props.note.tagColor)) {
                customColors.value.push(props.note.tagColor);
            }
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

.tag-selector {
    display: flex;
    gap: 0.75rem;
    padding: 0.5rem 0.2rem;
}

.tag-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid transparent;
    background: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.tag-btn:hover {
    transform: scale(1.1);
}

.tag-btn.active {
    border-color: var(--text-primary);
    background: var(--bg-secondary);
    transform: scale(1.1);
    box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--accent-primary);
}

.tag-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
}

.custom-color-wrapper {
    position: relative;
    width: 36px;
    height: 36px;
}

.color-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
}

.add-color-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px dashed var(--glass-border);
    background: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
}

.custom-color-wrapper:hover .add-color-btn {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
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
