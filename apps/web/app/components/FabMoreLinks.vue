<template>
    <div class="fab-group">
        <!-- Manual Button -->
        <NuxtLink v-for="link in menuItems.slice(4)" :to="link.path" class="fab-btn manual-btn">
            <span class="material-symbols-outlined">{{ link.icon }}</span>
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
const menuItems = [
    { label: 'Inicio', icon: 'home', path: '/' },
    { label: 'Chat', icon: 'chat', path: '/chat' },
    { label: 'Task', icon: 'task_alt', path: '/task' },
    { label: 'Notes', icon: 'note', path: '/notes' },
    { label: 'Expenses', icon: 'paid', path: '/expenses' },
    { label: 'Calendar', icon: 'calendar_month', path: '/calendar' },
    { label: 'Insights', icon: 'analytics', path: '/insights' },
];
</script>

<style scoped>
.fab-group {
    position: fixed;
    flex-direction: column;
    bottom: 1rem;
    right: 1rem;
    z-index: 200;
    display: flex;
    gap: 1rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-radius: 100px;
    box-shadow: 0 20px 40px var(--shadow);
}

.fab-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 1.25rem;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    white-space: nowrap;
    text-decoration: none;
}

.chat-btn {
    background: var(--accent-primary);
    color: white;
    box-shadow: 0 10px 20px var(--glow);
}

.manual-btn {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--glass-border);
}

.fab-btn:hover {
    transform: translateY(-4px) scale(1.02);
    filter: brightness(1.1);
}

.emoji-icon,
.add-icon {
    font-size: 1.25rem;
}

.fab-text {
    font-weight: 700;
    font-size: 0.85rem;
}

.ai-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.6rem;
    font-weight: 900;
}

@media (max-width: 768px) {
    .fab-group {
        bottom: 90px;
        gap: 0.5rem;
    }

    .fab-btn {
        flex: 1;
        justify-content: center;
        padding: 0.75rem 0.5rem;
    }

    .fab-text {
        font-size: 0.75rem;
    }
}
</style>
