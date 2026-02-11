<template>
    <div class="base-textarea-group">
        <label v-if="label" :for="id" class="base-label">{{ label }}</label>
        <textarea :id="id" :value="modelValue" :placeholder="placeholder" :required="required" :disabled="disabled"
            :rows="rows" class="base-textarea"
            @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"></textarea>
    </div>
</template>

<script setup lang="ts">
interface Props {
    modelValue: string;
    label?: string;
    id?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number | string;
}

withDefaults(defineProps<Props>(), {
    placeholder: '',
    required: false,
    disabled: false,
    rows: 3
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-textarea-group {
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

.base-textarea {
    width: 100%;
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    resize: vertical;
    min-height: 80px;
    box-sizing: border-box;
}

.base-textarea:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 4px var(--glow);
    background: var(--bg-secondary);
}

.base-textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
