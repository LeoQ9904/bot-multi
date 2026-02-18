<template>
    <section class="task-section">
        <button class="section-header" @click="isExpanded = !isExpanded">
            <span class="material-symbols-outlined expand-icon" :class="{ 'collapsed': !isExpanded }">
                expand_more
            </span>
            <h2 class="section-title">{{ title }}</h2>
            <div class="header-line"></div>
            <span class="section-count">{{ tasks.length }} TAREAS</span>
        </button>

        <div v-if="isExpanded" class="task-grid">
            <TaskCard v-for="task in tasks" :key="task.id" :task="task" @start="$emit('start', $event)"
                @stop="$emit('stop', $event)" @complete="$emit('complete', $event)" @edit="$emit('edit', $event)"
                @more="$emit('more', $event)" @preview="$emit('preview', $event)" />
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TaskCard from './TaskCard.vue';

defineProps<{
    title: string;
    tasks: any[];
}>();

const isExpanded = ref(true);

defineEmits(['start', 'stop', 'complete', 'edit', 'more', 'preview']);
</script>

<style scoped>
.task-section {
    display: flex;
    flex-direction: column;
    margin-bottom: 2rem;
}

.section-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
}

.expand-icon {
    color: var(--text-tertiary);
    transition: transform 0.2s;
}

.expand-icon.collapsed {
    transform: rotate(-90deg);
}

.section-header:hover .expand-icon {
    color: var(--accent-primary);
}

.section-title {
    font-size: 0.6875rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--text-tertiary);
    margin: 0;
    white-space: nowrap;
}

.header-line {
    flex-grow: 1;
    height: 1px;
    background: var(--glass-border);
}

.section-count {
    font-size: 0.625rem;
    font-weight: 700;
    color: var(--accent-primary);
    background: var(--glow);
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--glass-border);
    white-space: nowrap;
}

.task-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
}

@media (min-width: 768px) {
    .task-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 1280px) {
    .task-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}
</style>
