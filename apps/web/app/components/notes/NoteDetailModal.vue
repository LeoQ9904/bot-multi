<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-content glass-morphism">
            <div class="modal-header">
                <div class="title-section">
                    <span class="tag-dot"
                        :style="note?.tagColor.startsWith('#') ? { backgroundColor: note.tagColor } : { backgroundColor: `var(--accent-${note?.tagColor})` }"></span>
                    <h2 class="modal-title">{{ note?.title }}</h2>
                </div>
                <div class="header-actions">
                    <button class="action-btn" @click="$emit('edit', note)">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="action-btn close" @click="close">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>

            <div class="note-body">
                <div class="note-content" v-html="formattedContent"></div>
            </div>

            <div class="modal-footer">
                <div class="note-info">
                    <span>Creado el {{ formatDate(note?.createdAt) }}</span>
                    <span v-if="note?.updatedAt !== note?.createdAt">• Actualizado el {{ formatDate(note?.updatedAt)
                    }}</span>
                </div>
                <button class="btn-delete" @click="$emit('delete', note)">
                    <span class="material-symbols-outlined">delete</span>
                    Eliminar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Note } from '../../types/note.types';
import { marked } from 'marked';

const props = defineProps<{
    isOpen: boolean;
    note: Note | null;
}>();

const emit = defineEmits(['close', 'edit', 'delete']);

const formattedContent = computed(() => {
    if (!props.note?.content) return '';
    return marked(props.note.content);
});

const close = () => {
    emit('close');
};

const formatDate = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.modal-content {
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    border-radius: 28px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    animation: modal-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

@keyframes modal-in {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.modal-header {
    padding: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--glass-border);
}

.title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0;
}

.tag-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

.action-btn {
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn:hover {
    background: var(--bg-primary);
    color: var(--accent-primary);
}

.action-btn.close:hover {
    color: var(--text-primary);
}

.note-body {
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
    color: var(--text-primary);
    line-height: 1.6;
}

.note-content :deep(p) {
    margin-bottom: 1rem;
}

.note-content :deep(h1, h2, h3) {
    margin: 1.5rem 0 1rem;
    color: var(--text-primary);
}

.note-content :deep(ul, ol) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
}

.note-content :deep(code) {
    background: var(--bg-tertiary);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
}

.modal-footer {
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--glass-border);
    background: rgba(var(--bg-secondary-rgb), 0.5);
}

.note-info {
    display: flex;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-tertiary);
}

.btn-delete {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-delete:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: #ef4444;
}

.glass-morphism {
    background: rgba(var(--bg-secondary-rgb, 19, 24, 37), 0.9);
    backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
}
</style>
