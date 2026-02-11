<template>
    <section class="task-section">
        <div class="section-divider">
            <h2 class="section-title">{{ title }}</h2>
            <div class="divider-line"></div>
            <span class="section-count">{{ tasks.length }}</span>
        </div>

        <div class="task-list">
            <TaskCard v-for="task in tasks" :key="task.id" :task="task" @start="$emit('start', $event)"
                @edit="$emit('edit', $event)" @more="$emit('more', $event)" />
        </div>
    </section>
</template>

<script setup lang="ts">
import TaskCard from './TaskCard.vue';

defineProps<{
    title: string;
    tasks: any[];
}>();

defineEmits(['start', 'edit', 'more']);
</script>

<style scoped>
.task-section {
    display: flex;
    flex-direction: column;
}

.section-divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

.section-title {
    font-size: 0.75rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
    margin: 0;
}

.divider-line {
    flex-grow: 1;
    height: 1px;
    background: var(--glass-border);
}

.section-count {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-tertiary);
    background: var(--bg-tertiary);
    padding: 2px 8px;
    border-radius: 4px;
}

.task-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

@media (max-width: 768px) {
    .task-section {
        gap: 0.5rem;
    }
}
</style>
