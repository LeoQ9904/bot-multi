<template>
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container glass-panel shadow-2xl" :style="{ maxWidth: maxWidth || '64rem' }">
            <!-- Header -->
            <header v-if="$slots.header || title" class="modal-header">
                <slot name="header">
                    <div class="header-left">
                        <div v-if="icon" class="header-icon-box">
                            <span class="material-symbols-outlined">{{ icon }}</span>
                        </div>
                        <div class="header-text">
                            <h2 style="color: var(--text-primary);">{{ title }}</h2>
                            <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
                        </div>
                    </div>
                </slot>
                <button v-if="showClose" class="close-btn" @click="$emit('close')">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </header>

            <!-- Persistent Top Content (e.g. AI Prompt) -->
            <div v-if="$slots.top" class="modal-top">
                <slot name="top"></slot>
            </div>

            <!-- Scrollable Content -->
            <div class="modal-body custom-scrollbar">
                <slot></slot>
            </div>

            <!-- Footer -->
            <footer v-if="$slots.footer" class="modal-footer">
                <slot name="footer"></slot>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    show: boolean;
    title?: string;
    subtitle?: string;
    icon?: string;
    showClose?: boolean;
    maxWidth?: string;
}

withDefaults(defineProps<Props>(), {
    show: false,
    showClose: true
});

defineEmits(['close']);
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--shadow);
    backdrop-filter: blur(8px);
    z-index: 2100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
}

.modal-container {
    width: 100%;
    max-height: 90vh;
    border-radius: 2rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: modalScaleIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

@keyframes modalScaleIn {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.glass-panel {
    background: var(--bg-secondary);
    backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
}

/* Header */
.modal-header {
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(var(--bg-secondary-rgb), 0.4);
    border-bottom: 1px solid var(--glass-border);
    flex-shrink: 0;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-icon-box {
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(var(--accent-primary-rgb), 0.1);
    border: 1px solid rgba(var(--accent-primary-rgb), 0.2);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-primary);
}

.header-text h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
}

.subtitle {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text-tertiary);
    font-weight: 600;
    margin: 2px 0 0;
}

.close-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: all 0.2s;
}

.close-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

/* Body */
.modal-body {
    padding: 2rem;
    flex: 1;
    overflow-y: auto;
}

/* Footer */
.modal-footer {
    padding: 1.5rem 2rem;
    background: rgba(var(--bg-secondary-rgb), 0.8);
    backdrop-filter: blur(24px);
    border-top: 1px solid var(--glass-border);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--bg-tertiary);
    border-radius: 10px;
}

@media (max-width: 768px) {
    .modal-overlay {
        padding: 0.5rem;
    }

    .modal-container {
        max-width: 100% !important;
        max-height: 100%;
        border-radius: 0;
    }

    .modal-header {
        padding: 0.5rem 0.8rem;
    }

    .modal-body {
        padding: 0.5rem 0.8rem;
    }

    .modal-footer {
        padding: 0.5rem 0.8rem;
        flex-direction: column-reverse;
        /* Usually buttons stack better this way on mobile if many */
        gap: 0.5rem;
    }
}
</style>
