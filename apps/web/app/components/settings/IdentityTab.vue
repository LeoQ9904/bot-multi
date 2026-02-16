<script setup lang="ts">
import { reactive, watch } from 'vue';

const props = defineProps<{
    identity: {
        name: string;
        greeting: string;
        personality: string;
        interests: string;
    };
    isSaving: boolean;
}>();

const emit = defineEmits(['save']);

// Local reactive copy to avoid direct mutation of props
const localIdentity = reactive({ ...props.identity });

watch(() => props.identity, (newVal) => {
    Object.assign(localIdentity, newVal);
}, { deep: true });
</script>

<template>
    <div class="tab-pane">
        <div class="settings-section">
            <div class="form-group">
                <label>
                    <span class="material-symbols-outlined label-icon">smart_toy</span>
                    Nombre del Bot
                </label>
                <input v-model="localIdentity.name" type="text" class="glass-input" placeholder="ej. Aether Pilot"
                    :disabled="isSaving" />
                <p class="form-help">¿Cómo quieres que se identifique tu IA?</p>
            </div>

            <div class="form-group">
                <label>
                    <span class="material-symbols-outlined label-icon">chat_bubble</span>
                    Saludo Inicial
                </label>
                <input v-model="localIdentity.greeting" type="text" class="glass-input"
                    placeholder="ej. ¡Hola! ¿Cómo puedo ayudarte?" :disabled="isSaving" />
                <p class="form-help">El mensaje de bienvenida en Telegram.</p>
            </div>

            <div class="form-group">
                <label>
                    <span class="material-symbols-outlined label-icon">interests</span>
                    Mis intereses
                </label>
                <textarea v-model="localIdentity.interests" class="glass-input textarea" rows="5"
                    placeholder="ej. Me gusta hablar de tecnologia, programacion, IA, etc."
                    :disabled="isSaving"></textarea>
                <p class="form-help">Define los intereses de tu IA.</p>
            </div>

            <div class="form-group">
                <label>
                    <span class="material-symbols-outlined label-icon">psychology</span>
                    Personalidad e Instrucciones
                </label>
                <textarea v-model="localIdentity.personality" class="glass-input textarea" rows="5"
                    placeholder="ej. Eres un asistente profesional y conciso..." :disabled="isSaving"></textarea>
                <p class="form-help">Define el tono y las reglas de comportamiento.</p>
            </div>

            <button @click="$emit('save', localIdentity)" class="btn btn-primary w-full" :disabled="isSaving">
                <span v-if="!isSaving" class="material-symbols-outlined button-icon">save</span>
                <span v-else class="material-symbols-outlined button-icon-sm spinning">sync</span>
                <span>{{ isSaving ? 'Guardando...' : 'Guardar Identidad' }}</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.form-group {
    margin-bottom: 2rem;
}

.form-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
}

.label-icon {
    font-size: 1.1rem;
    color: var(--accent-primary);
}

.form-help {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    margin-top: 0.5rem;
}

.glass-input {
    width: 100%;
    padding: 1rem;
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.95rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
}

.glass-input:hover {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.2);
}

.glass-input:focus {
    outline: none;
    background: var(--bg-secondary);
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.textarea {
    resize: vertical;
    min-height: 140px;
    line-height: 1.6;
}

.btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.button-icon {
    font-size: 1.25rem;
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.tab-pane {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.w-full {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
