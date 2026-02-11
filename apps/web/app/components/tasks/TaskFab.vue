<template>
    <div class="fab-container">
        <button class="fab-btn" @click="$emit('click')">
            <span class="material-symbols-outlined add-icon">add_circle</span>
            <span class="fab-text">Nueva Tarea por Chat</span>
            <div class="ai-badge">AI</div>
        </button>
    </div>
</template>

<script setup lang="ts">
defineEmits(['click']);
</script>

<style scoped>
.fab-container {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
}

.fab-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--accent-primary);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 100px;
    border: none;
    box-shadow: 0 15px 30px var(--glow);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fab-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 20px 40px var(--glow);
    filter: brightness(1.1);
}

.add-icon {
    font-size: 1.5rem;
    transition: transform 0.3s ease;
}

.fab-btn:hover .add-icon {
    transform: rotate(90deg);
}

.fab-text {
    font-weight: 700;
    letter-spacing: -0.01em;
}

.ai-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 900;
    text-transform: uppercase;
}

@media (max-width: 768px) {
    .fab-container {
        bottom: 90px;
        width: calc(100% - 2rem);
        max-width: 360px;
    }

    .fab-btn {
        width: 100%;
        justify-content: center;
        padding: 0.875rem 1.25rem;
    }

    .fab-text {
        font-size: 0.9rem;
    }
}
</style>
