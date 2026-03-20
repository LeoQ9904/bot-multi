<template>
    <div class="base-input-group">
        <label v-if="label" :for="id" class="base-label">{{ label }}</label>
        <div class="input-wrapper" :class="{ 'smart-currency-wrapper': isCurrency }">
            <span v-if="isCurrency" class="smart-currency-symbol">$</span>
            <input :id="id" :type="type" :value="modelValue" :placeholder="placeholder" :required="required"
                :disabled="disabled" :min="min" :max="max" :step="step" class="base-input"
                :class="{ 'smart-currency-input': isCurrency }"
                @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
            <div v-if="$slots.icon" class="input-icon">
                <slot name="icon"></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    modelValue: string | number | undefined;
    label?: string;
    id?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    isCurrency?: boolean;
    min?: number | string;
    max?: number | string;
    step?: number | string;
}

withDefaults(defineProps<Props>(), {
    type: 'text',
    placeholder: '',
    required: false,
    disabled: false,
    isCurrency: false,
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-input-group {
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

.input-wrapper {
    position: relative;
    width: 100%;
}

.base-input {
    width: 100%;
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
}

.base-input:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 4px var(--glow);
    background: var(--bg-secondary);
}

.base-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.input-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
    pointer-events: none;
    display: flex;
    align-items: center;
}

/* Currency variant */
.smart-currency-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--bg-tertiary);
    border-radius: 1rem;
    padding: 1rem 1.5rem;
    border: 1px solid var(--glass-border);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.smart-currency-wrapper:focus-within {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 4px var(--glow);
    background: var(--bg-secondary);
}

.smart-currency-symbol {
    font-size: 1.875rem;
    font-weight: 800;
    color: var(--text-tertiary);
}

.base-input.smart-currency-input {
    background: transparent;
    border: none;
    font-size: 1.875rem;
    font-weight: 900;
    color: var(--text-primary);
    padding: 0;
    outline: none;
    box-shadow: none;
}

.base-input.smart-currency-input:focus {
    background: transparent;
    border: none;
    box-shadow: none;
}

/* Hide arrows for number input */
.base-input.smart-currency-input::-webkit-outer-spin-button,
.base-input.smart-currency-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.base-input.smart-currency-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
