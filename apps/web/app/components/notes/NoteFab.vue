<template>
    <button class="note-fab glass" @click="$emit('click')" title="Nueva nota">
        <span class="material-symbols-outlined">add</span>
        <span class="fab-text">Nueva Nota</span>
    </button>
</template>

<script setup lang="ts">
defineEmits(['click']);
</script>

<style scoped>
.note-fab {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem 1.5rem;
    border-radius: 100px;
    color: white;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    border: none;
    cursor: pointer;
    box-shadow: 0 8px 32px -8px rgba(var(--accent-primary-rgb), 0.5), var(--shadow);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 100;
}

.note-fab:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 40px -8px rgba(var(--accent-primary-rgb), 0.6), var(--shadow);
}

.note-fab span {
    font-size: 1.5rem;
}

.fab-text {
    font-weight: 600;
    letter-spacing: 0.01em;
}

@media (max-width: 640px) {
    .note-fab {
        bottom: 5.5rem;
        right: 1.5rem;
        padding: 0.8rem;
    }

    .fab-text {
        display: none;
    }
}

.glass {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
}
</style>
