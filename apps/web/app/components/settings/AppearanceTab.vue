<script setup lang="ts">
defineProps<{
    selectedTheme: string;
    themes: Array<{ name: string; value: string; color: string }>;
}>();

defineEmits(['update:theme']);
</script>

<template>
    <div class="tab-pane">
        <div class="settings-section">
            <h3>Tema Visual</h3>
            <div class="theme-grid">
                <button v-for="theme in themes" :key="theme.value" @click="$emit('update:theme', theme.value)"
                    class="theme-option" :class="{ active: selectedTheme === theme.value }">
                    <div class="theme-preview" :style="{ backgroundColor: theme.color }"></div>
                    <span>{{ theme.name }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-section h3 {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
}

.theme-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.theme-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--bg-tertiary);
    border: 2px solid transparent;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-primary);
}

.theme-option:hover {
    background: var(--glass-bg);
}

.theme-option.active {
    border-color: var(--accent-primary);
    background: var(--glass-bg);
}

.theme-preview {
    width: 100%;
    height: 48px;
    border-radius: 10px;
    border: 1px solid var(--glass-border);
}

.tab-pane {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
