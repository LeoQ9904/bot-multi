<template>
    <div class="tag-filters">
        <button v-for="color in tagColors" :key="color" class="tag-filter-btn"
            :class="{ active: selectedTag === color }" @click="handleTagClick(color)"
            :title="`Filtrar por ${getColorLabel(color)}`">
            <span class="tag-dot" :style="getColorStyle(color)"></span>
        </button>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    tagColors: string[];
    selectedTag?: string;
}>();

const emit = defineEmits<{
    'update:selectedTag': [value: string];
}>();

const getColorStyle = (color: string) => {
    if (color.startsWith('#')) {
        return { backgroundColor: color };
    }
    return { backgroundColor: `var(--accent-${color})` };
};

const getColorLabel = (color: string) => {
    if (color.startsWith('#')) {
        return color;
    }
    // Map common color names to Spanish labels
    const colorLabels: Record<string, string> = {
        'red': 'rojo',
        'blue': 'azul',
        'green': 'verde',
        'emerald': 'esmeralda',
        'amber': 'ámbar',
        'purple': 'morado',
        'pink': 'rosa',
        'yellow': 'amarillo'
    };
    return colorLabels[color] || color;
};

const handleTagClick = (color: string) => {
    // Toggle: if already selected, deselect; otherwise select
    emit('update:selectedTag', props.selectedTag === color ? '' : color);
};
</script>

<style scoped>
.tag-filters {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.tag-filter-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid transparent;
    background: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.tag-filter-btn:hover {
    transform: scale(1.1);
}

.tag-filter-btn.active {
    border-color: var(--text-primary);
    background: var(--bg-secondary);
    box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--accent-primary);
}

.tag-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}
</style>
