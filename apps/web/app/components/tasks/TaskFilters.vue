<template>
    <div class="filter-bar">
        <button v-for="filter in filters" :key="filter" class="filter-chip" :class="{ active: modelValue === filter }"
            @click="$emit('update:modelValue', filter)">
            {{ filter }}
            <span class="material-symbols-outlined">expand_more</span>
        </button>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    modelValue: string;
    filters: string[];
}>();

defineEmits(['update:modelValue']);
</script>

<style scoped>
.filter-bar {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 2.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
}

.filter-chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 1rem;
    border-radius: 100px;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
}

.filter-chip:hover {
    border-color: var(--accent-primary);
}

.filter-chip.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
}

@media (max-width: 768px) {
    .filter-bar {
        margin-bottom: 1.5rem;
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .filter-bar::-webkit-scrollbar {
        display: none;
    }
}
</style>
