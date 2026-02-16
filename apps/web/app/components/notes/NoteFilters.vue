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
            <TagFilters :tag-colors="tagColors" :selected-tag="selectedTag"
                @update:selected-tag="$emit('update:selectedTag', $event)" />

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
import TagFilters from '../ui/TagFilters.vue';

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



.glass {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
}
</style>
