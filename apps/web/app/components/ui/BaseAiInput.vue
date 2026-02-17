<template>
    <div class="ai-section">
        <div class="ai-gradient-border">
            <div class="ai-input-container">
                <span class="material-symbols-outlined ai-icon">auto_awesome</span>
                <input :value="modelValue"
                    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" class="ai-input"
                    :placeholder="placeholder" type="text" :disabled="loading" />
                <button @click="$emit('process')" class="ai-btn" :disabled="loading">
                    <template v-if="loading">
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

<script setup lang="ts">
import Loader from '../icons/Loader.vue';

interface Props {
    modelValue: string;
    loading?: boolean;
    placeholder?: string;
}

withDefaults(defineProps<Props>(), {
    loading: false,
    placeholder: 'Dime qué necesitas hacer...'
});

defineEmits(['update:modelValue', 'process']);
</script>

<style scoped>
.ai-section {
    padding: 1rem;
}

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

@media (max-width: 768px) {
    .ai-btn {
        padding: 0.5rem 0.8rem;
    }

    .ai-input-container {
        padding: 0.5rem 0.8rem;
        gap: 0.5rem;
    }

    .not-view-text-movil {
        display: none;
    }
}
</style>
