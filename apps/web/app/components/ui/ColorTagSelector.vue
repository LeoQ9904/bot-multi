<template>
    <div class="color-tag-selector">
        <label v-if="label" class="selector-label">{{ label }}</label>
        <div class="tag-selector">
            <button v-for="color in allColors" :key="color" type="button" class="tag-btn"
                :class="{ active: modelValue === color }" @click="selectColor(color)">
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
    modelValue: string;
    availableColors: string[];
    label?: string;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const customColors = ref<string[]>([]);
const customColorValue = ref('#000000');

const allColors = computed(() => {
    // Combine available colors with local custom colors
    const uniqueCustom = customColors.value.filter(c => !props.availableColors.includes(c));
    return [...props.availableColors, ...uniqueCustom];
});

const getColorStyle = (color: string) => {
    if (color.startsWith('#')) {
        return { backgroundColor: color };
    }
    return { backgroundColor: `var(--accent-${color})` };
};

const selectColor = (color: string) => {
    emit('update:modelValue', color);
};

const handleCustomColor = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    customColorValue.value = color;

    // Add to custom colors if not already there
    if (!customColors.value.includes(color) && !props.availableColors.includes(color)) {
        customColors.value.push(color);
    }
    emit('update:modelValue', color);
};
</script>

<style scoped>
.color-tag-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.selector-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
    padding-left: 0.2rem;
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
</style>
