<template>
    <section class="dashboard-section recent-notes-section">
        <div class="section-header">
            <div class="header-left">
                <span class="material-symbols-outlined section-icon">description</span>
                <h3 class="section-title-dashboard">Notas Recientes</h3>
            </div>
            <button class="btn-text" @click="openNewNote">
                <span class="material-symbols-outlined">add</span>
                Nueva nota
            </button>
        </div>

        <div class="notes-grid">
            <NoteCard v-for="note in notes" :key="note.id" :note="note" @click="openViewNote(note.id)"></NoteCard>

            <!-- Quick Create Card -->
            <div class="quick-create-card" @click="openNewNote">
                <div class="add-icon-wrapper">
                    <span class="material-symbols-outlined">add</span>
                </div>
                <p class="quick-create-text">Crear nota rápida</p>
                <span class="shortcut-hint">Ctrl + N</span>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { Note } from '~/types/note.types';
import { useNoteActions } from '~/composables/useNoteActions';
import NoteCard from '../notes/NoteCard.vue';

defineProps<{
    notes: Note[];
}>();

const { openNewNote, openViewNote } = useNoteActions();

const getExcerpt = (content: string) => {
    // Strip HTML/Markdown if necessary, but for now just slice
    return content.length > 100 ? content.slice(0, 100) + '...' : content;
};

const formatDate = (date: number | string | Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getTagColor = (colorName: string) => {
    const colors: Record<string, string> = {
        'blue': '#3b82f6',
        'purple': '#a855f7',
        'emerald': '#10b981',
        'amber': '#f59e0b',
        'red': '#ef4444',
        'gray': '#9ca3af',
        'pink': '#ec4899',
        'indigo': '#6366f1'
    };
    return colors[colorName] || colorName || '#9ca3af';
};
</script>

<style scoped>
.dashboard-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--glass-border);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.section-icon {
    color: var(--text-tertiary);
}

.section-title-dashboard {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
}

.btn-text {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: none;
    border: none;
    color: var(--accent-primary);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background 0.2s;
}

.btn-text:hover {
    background: rgba(var(--accent-primary-rgb), 0.1);
    background: rgba(102, 126, 234, 0.1);
}

.notes-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
}

@media (min-width: 768px) {
    .notes-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .notes-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.glass-panel {
    background: var(--bg-tertiary);
    background: rgba(var(--bg-secondary-rgb, 19, 24, 37), 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.glass-panel:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
}

.note-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
}

.note-tag {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    border: 1px solid transparent;
}

.open-icon {
    font-size: 1.25rem;
    color: var(--text-tertiary);
    opacity: 0;
    transition: opacity 0.2s;
}

.glass-panel:hover .open-icon {
    opacity: 1;
}

.note-title {
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
}

.note-excerpt {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.6;
    flex-grow: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 1rem;
}

.note-footer {
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.note-date {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    text-transform: uppercase;
    font-weight: 600;
}

.note-meta-dots {
    display: flex;
    gap: -4px;
}

.quick-create-card {
    border: 2px dashed var(--glass-border);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(255, 255, 255, 0.02);
}

.quick-create-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--text-secondary);
}

.add-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
    transition: transform 0.2s;
}

.quick-create-card:hover .add-icon-wrapper {
    transform: scale(1.1);
    color: var(--accent-primary);
}

.quick-create-text {
    font-weight: 700;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.shortcut-hint {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    margin-top: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

@media (max-width: 1023px) {
    .quick-create-card {
        display: none;
    }
}
</style>
