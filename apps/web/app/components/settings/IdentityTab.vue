<script setup lang="ts">
import { reactive, watch, ref, onMounted } from 'vue';

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

const PREDEFINED_INTERESTS = [
    'Tecnología', 'Inteligencia Artificial', 'Programación', 'Productividad',
    'Salud', 'Finanzas', 'Entretenimiento', 'Noticias',
    'Educación', 'Deportes', 'Estilo de Vida', 'Ciencia', 'Arte', 'Música', 'Cine', 'Viajes', 'Libros', 'Cocina'
];

// Local reactive copy to avoid direct mutation of props
const localIdentity = reactive({ ...props.identity });
const selectedInterests = ref<string[]>([]);

// Initialize selections from prop
const syncInterests = () => {
    if (props.identity.interests) {
        selectedInterests.value = props.identity.interests
            .split(',')
            .map(i => i.trim())
            .filter(i => i !== '');
    } else {
        selectedInterests.value = [];
    }
};

onMounted(syncInterests);

watch(() => props.identity, (newVal) => {
    Object.assign(localIdentity, newVal);
    syncInterests();
}, { deep: true });

const handleSave = () => {
    // Convert array back to comma-separated string
    localIdentity.interests = selectedInterests.value.join(', ');
    emit('save', localIdentity);
};
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
                    <span class="material-symbols-outlined label-icon">psychology</span>
                    Personalidad e Instrucciones
                </label>
                <textarea v-model="localIdentity.personality" class="glass-input textarea" rows="5"
                    placeholder="ej. Eres un asistente profesional y conciso..." :disabled="isSaving"></textarea>
                <p class="form-help">Define el tono y las reglas de comportamiento.</p>
            </div>

            <div class="form-group">
                <label>
                    <span class="material-symbols-outlined label-icon">interests</span>
                    Mis intereses
                </label>
                <div class="interests-grid">
                    <label v-for="interest in PREDEFINED_INTERESTS" :key="interest" class="interest-item"
                        :class="{ active: selectedInterests.includes(interest) }">
                        <input type="checkbox" v-model="selectedInterests" :value="interest" :disabled="isSaving" />
                        <span class="checkbox-custom"></span>
                        <span class="interest-label">{{ interest }}</span>
                    </label>
                </div>
                <p class="form-help">Define los intereses de tu IA seleccionando los temas relevantes.</p>
            </div>

            <Teleport to="#panel-footer-settings">
                <button @click="handleSave" class="btn btn-primary w-full" :disabled="isSaving">
                    <span v-if="!isSaving" class="material-symbols-outlined button-icon">save</span>
                    <span v-else class="material-symbols-outlined button-icon-sm spinning">sync</span>
                    <span>{{ isSaving ? 'Guardando...' : 'Guardar Identidad' }}</span>
                </button>
            </Teleport>
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

/* Interests Grid */
.interests-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
}

.interest-item {
    position: relative;
    display: flex !important;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    margin-bottom: 0 !important;
}

.interest-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
}

.interest-item.active {
    background: rgba(var(--accent-primary-rgb), 0.1);
}

.interest-item input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

.checkbox-custom {
    position: relative;
    height: 18px;
    width: 18px;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    border-radius: 4px;
    flex-shrink: 0;
}

.interest-item.active .checkbox-custom {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
}

.checkbox-custom:after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 4px;
    height: 9px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.interest-item.active .checkbox-custom:after {
    display: block;
}

.interest-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.interest-item.active .interest-label {
    color: var(--text-primary);
    font-weight: 700;
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
