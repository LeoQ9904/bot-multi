<template>
    <div class="note-card glass" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
        <div class="note-content-wrapper">
            <div class="title-row">
                <div class="title-main">
                    <span class="tag-dot"
                        :style="note.tagColor.startsWith('#') ? { backgroundColor: note.tagColor } : { backgroundColor: `var(--accent-${note.tagColor})` }"></span>
                    <h3 class="note-title">{{ note.title }}</h3>
                </div>
                <div class="title-actions">
                    <button class="preview-btn-inline" @click="$emit('preview', note)" title="Ver nota">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                </div>
            </div>

            <div class="note-body">
                <p class="note-excerpt">{{ excerpt }}</p>
            </div>

            <div class="note-footer">
                <span class="note-date">{{ formatDate(note.createdAt) }}</span>
            </div>
        </div>

        <!-- Hover Actions Toolbar -->
        <div class="note-actions-overlay" :class="{ 'is-visible': isHovered }">
            <div class="actions-container glass-morphism">
                <button class="action-btn-small edit-btn" @click="$emit('edit', note)" title="Editar">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="action-btn-small delete-btn" @click="$emit('delete', note)" title="Eliminar">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Note } from '../../types/note.types';

const props = defineProps<{
    note: Note;
}>();

defineEmits(['preview', 'edit', 'delete']);

const isHovered = ref(false);

const excerpt = computed(() => {
    if (!props.note.content) return '';
    return props.note.content.length > 100
        ? props.note.content.substring(0, 100) + '...'
        : props.note.content;
});

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};
</script>

<style scoped>
.note-card {
    position: relative;
    border-radius: 20px;
    padding: 1.25rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.note-card:hover {
    transform: translateY(-4px);
    border-color: var(--accent-primary);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.3);
}

.title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.title-main {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
}

.tag-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.note-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
}

.preview-btn-inline {
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 8px;
    transition: all 0.2s;
}

.preview-btn-inline:hover {
    color: var(--accent-primary);
    background: rgba(var(--accent-primary-rgb, 99, 102, 241), 0.1);
}

.note-body {
    flex: 1;
    margin-bottom: 1rem;
}

.note-excerpt {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.note-footer {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
}

.note-date {
    font-size: 0.75rem;
    color: var(--text-tertiary);
}

/* Actions Overlay - Same style as TaskCard */
.note-actions-overlay {
    position: absolute;
    bottom: 1.25rem;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    z-index: 20;
}

.note-actions-overlay.is-visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

.glass-morphism {
    background: rgba(var(--bg-secondary-rgb, 19, 24, 37), 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-radius: 100px;
    padding: 0.4rem;
    display: flex;
    gap: 0.5rem;
    box-shadow: var(--shadow);
}

.action-btn-small {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
    color: var(--text-secondary);
}

.action-btn-small span {
    font-size: 1.1rem;
}

.edit-btn:hover {
    background: rgba(var(--accent-primary-rgb, 99, 102, 241), 0.15);
    color: var(--accent-primary);
}

.delete-btn:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
}

.glass {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
}
</style>
