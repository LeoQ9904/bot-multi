<template>
    <div class="note-section">
        <div class="section-header" v-if="title">
            <h2 class="section-title">
                {{ title }}
                <span class="note-count">{{ notes.length }}</span>
            </h2>
        </div>

        <div class="notes-grid">
            <NoteCard v-for="note in notes" :key="note.id" :note="note" @preview="$emit('preview', $event)"
                @edit="$emit('edit', $event)" @delete="$emit('delete', $event)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import NoteCard from './NoteCard.vue';
import type { Note } from '../../types/note.types';

defineProps<{
    title?: string;
    notes: Note[];
}>();

defineEmits(['preview', 'edit', 'delete']);
</script>

<style scoped>
.note-section {
    margin-bottom: 2.5rem;
}

.section-header {
    margin-bottom: 1.25rem;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.note-count {
    font-size: 0.85rem;
    font-weight: 500;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    padding: 0.15rem 0.6rem;
    border-radius: 100px;
    border: 1px solid var(--glass-border);
}

.notes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

@media (max-width: 640px) {
    .notes-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
</style>
