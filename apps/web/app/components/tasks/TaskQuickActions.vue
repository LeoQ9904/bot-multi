<script setup>
const props = defineProps({
    task: {
        type: Object,
        required: true
    },
    showPreview: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['start', 'stop', 'complete', 'cancel', 'edit', 'more', 'preview']);
</script>
<template>
    <button v-if="task.status === 'in-progress'" class="action-btn pause" @click.stop="$emit('stop', task)"
        title="Pausar">
        <span class="material-symbols-outlined">pause</span>
    </button>
    <button v-else class="action-btn play" @click.stop="$emit('start', task)" title="Iniciar">
        <span class="material-symbols-outlined font-fill">play_arrow</span>
    </button>
    <button class="action-btn check" @click.stop="$emit('complete', task)" title="Terminar">
        <span class="material-symbols-outlined">check</span>
    </button>
    <button class="action-btn delete" @click.stop="$emit('more', task)" title="Eliminar">
        <span class="material-symbols-outlined">delete</span>
    </button>
    <button class="action-btn edit" @click.stop="$emit('edit', task)" title="Editar">
        <span class="material-symbols-outlined">edit</span>
    </button>
    <button v-if="showPreview" class="action-btn preview" @click.stop="$emit('preview', task)" title="Previsualizar">
        <span class="material-symbols-outlined">visibility</span>
    </button>
</template>
<style scoped>
.action-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn .material-symbols-outlined {
    font-size: 1.125rem;
}

.play {
    background: rgba(var(--bg-tertiary-rgb), 0.5);
    color: var(--accent-blue);
    border-color: var(--accent-blue);
}

.play:hover {
    background: var(--accent-blue);
    color: white;
}

.pause {
    background: var(--glass-bg);
    color: var(--text-secondary);
    border-color: var(--glass-border);
}

.pause:hover {
    background: var(--glass-bg);
    color: var(--text-primary);
}

.check {
    background: rgba(var(--bg-tertiary-rgb), 0.5);
    color: var(--accent-emerald);
    border-color: var(--accent-emerald);
}

.check:hover {
    background: var(--accent-emerald);
    color: white;
}

.delete {
    background: rgba(var(--bg-tertiary-rgb), 0.5);
    color: var(--accent-red);
    border-color: var(--accent-red);
}

.delete:hover {
    background: var(--accent-red);
    color: white;
}

.edit {
    background: rgba(var(--bg-tertiary-rgb), 0.5);
    color: var(--accent-purple);
    border-color: var(--accent-purple);
}

.edit:hover {
    background: var(--accent-purple);
    color: white;
}

.preview {
    background: rgba(var(--bg-tertiary-rgb), 0.5);
    color: var(--text-secondary);
    border-color: var(--glass-border);
}

.preview:hover {
    background: var(--glass-bg);
    color: var(--text-primary);
}
</style>