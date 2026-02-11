<template>
    <div class="base-select-group">
        <label v-if="label" :for="id" class="base-label">{{ label }}</label>
        <div class="select-wrapper">
            <select :id="id" :value="modelValue" :required="required" :disabled="disabled" class="base-select"
                @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
                <slot></slot>
            </select>
            <span class="material-symbols-outlined expand-icon">expand_more</span>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    modelValue: string | number;
    label?: string;
    id?: string;
    required?: boolean;
    disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
    required: false,
    disabled: false
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-select-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

.base-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-tertiary);
}

.select-wrapper {
    position: relative;
    width: 100%;
}

.base-select {
    width: 100%;
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    padding-right: 2.5rem;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    appearance: none;
    box-sizing: border-box;
}

.base-select:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 4px var(--glow);
    background: var(--bg-secondary);
}

.expand-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
    pointer-events: none;
}
</style>
