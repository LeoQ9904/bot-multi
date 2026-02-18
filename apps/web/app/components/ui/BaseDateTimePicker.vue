<template>
    <div class="date-picker-group">
        <label v-if="label" class="base-label">{{ label }}</label>

        <div class="quick-options">
            <button v-for="opt in quickOptions" :key="opt.label" type="button" class="quick-btn"
                :class="{ active: isQuickActive(opt.getValue()) }" @click="selectQuick(opt.getValue())">
                {{ opt.label }}
            </button>
        </div>

        <div class="picker-wrapper">
            <VueDatePicker :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" dark
                format="dd/MM/yyyy HH:mm" auto-apply :teleport="true" placeholder="Seleccionar fecha y hora"
                class="custom-datepicker">
                <template #input-icon>
                    <span class="material-symbols-outlined emoji-icon">calendar_today</span>
                </template>
            </VueDatePicker>
        </div>
    </div>
</template>

<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

interface Props {
    modelValue: number | Date;
    label?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const quickOptions = [
    {
        label: 'Hoy', getValue: () => {
            const d = new Date();
            d.setHours(9, 0, 0, 0);
            return d.toISOString();
        }
    },
    {
        label: 'Mañana', getValue: () => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            d.setHours(9, 0, 0, 0);
            return d.toISOString();
        }
    },
    {
        label: 'Próx. Lunes', getValue: () => {
            const d = new Date();
            d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
            d.setHours(9, 0, 0, 0);
            return d.toISOString();
        }
    }
];

const selectQuick = (timestamp: number) => {
    emit('update:modelValue', timestamp);
};

const isQuickActive = (timestamp: number) => {
    const d1 = new Date(timestamp);
    const d2 = new Date(props.modelValue);
    return d1.toDateString() === d2.toDateString();
};
</script>

<style scoped>
.date-picker-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
}

.base-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-tertiary);
}

.quick-options {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.quick-btn {
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    border: 1px solid var(--glass-border);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}

.quick-btn:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.quick-btn.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
}

.picker-wrapper {
    width: 100%;
}

:deep(.dp__theme_dark) {
    --dp-background-color: var(--bg-tertiary);
    --dp-text-color: var(--text-primary);
    --dp-hover-color: var(--bg-secondary);
    --dp-hover-text-color: var(--text-primary);
    --dp-hover-icon-color: var(--accent-primary);
    --dp-primary-color: var(--accent-primary);
    --dp-primary-text-color: #ffffff;
    --dp-secondary-color: var(--text-tertiary);
    --dp-border-color: var(--glass-border);
    --dp-menu-border-color: var(--glass-border);
    --dp-menu-min-width: 260px;
    --dp-border-radius: 12px;
}

:deep(.dp__input) {
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 0.75rem 1rem 0.75rem 2.8rem;
    font-family: inherit;
    font-size: 0.9rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.dp__input:focus) {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 4px var(--glow);
}

:deep(.dp__input_icon) {
    left: 1rem;
}

.emoji-icon {
    font-size: 1.25rem;
    color: var(--text-tertiary);
}
</style>
