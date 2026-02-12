<template>
    <div class="note-filters-container">
        <div class="search-bar glass">
            <span class="material-symbols-outlined search-icon">search</span>
            <input type="text" :value="search"
                @input="$emit('update:search', ($event.target as HTMLInputElement).value)" placeholder="Buscar notas..."
                class="search-input" />
        </div>

        <div class="filters-actions">
            <!-- Tag Filters -->
            <div class="tag-filters">
                <button v-for="color in tagColors" :key="color" class="tag-filter-btn"
                    :class="{ active: selectedTag === color }"
                    @click="$emit('update:selectedTag', selectedTag === color ? '' : color)"
                    :title="`Filtrar por ${color}`">
                    <span class="tag-dot"
                        :style="color.startsWith('#') ? { backgroundColor: color } : { backgroundColor: `var(--accent-${color})` }"></span>
                </button>
            </div>

            <div class="view-actions">
                <!-- Any other actions for the filter bar -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    search: string;
    selectedTag: string;
}>();

const emit = defineEmits(['update:search', 'update:selectedTag']);

import { useNoteStore } from '../../stores/note.store';
const noteStore = useNoteStore();
const tagColors = computed(() => noteStore.allTagColors);
</script>

<style scoped>
.note-filters-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: 2rem;
}

.search-bar {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.25rem;
    border-radius: 16px;
    gap: 0.75rem;
    background: var(--glass-bg);
}

.search-icon {
    color: var(--text-tertiary);
    font-size: 1.25rem;
}

.search-input {
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 1rem;
    width: 100%;
    outline: none;
}

.search-input::placeholder {
    color: var(--text-tertiary);
}

.filters-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.tag-filters {
    display: flex;
    gap: 0.5rem;
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
}

.tag-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.glass {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
}
</style>
