<template>
    <div class="fab-group">
        <!-- Chat Button -->
        <button class="fab-btn chat-btn" @click="$emit('chat')">
            <span class="material-symbols-outlined emoji-icon">forum</span>
            <span class="fab-text">Tarea por Chat</span>
            <div class="ai-badge">AI</div>
        </button>

        <!-- Manual Button -->
        <button class="fab-btn manual-btn" @click="$emit('manual')">
            <span class="material-symbols-outlined add-icon">add_circle</span>
            <span class="fab-text">Manual</span>
        </button>
    </div>
</template>

<script setup lang="ts">
defineEmits(['chat', 'manual']);
</script>

<style scoped>
.fab-group {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
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
        width: calc(100% - 2rem);
        max-width: 400px;
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
