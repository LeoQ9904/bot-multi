<template>
    <Teleport to="body">
        <Transition name="slide">
            <div v-if="show" class="side-panel-overlay" @click.self="$emit('close')">
                <div class="side-panel" :style="{ maxWidth }" @click.stop>
                    <!-- Header -->
                    <div class="panel-header" v-if="$slots.header || title">
                        <slot name="header">
                            <div class="header-content">
                                <h2 class="panel-title">{{ title }}</h2>
                                <p v-if="subtitle" class="panel-subtitle">{{ subtitle }}</p>
                            </div>
                            <div class="header-actions">
                                <slot name="header-actions"></slot>
                                <button v-if="showClose" class="icon-btn-small" @click="$emit('close')" title="Cerrar">
                                    <span class="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </slot>
                    </div>

                    <div v-if="$slots.top" class="modal-top">
                        <slot name="top"></slot>
                    </div>

                    <!-- Scrollable Content -->
                    <div class="panel-content custom-scrollbar">
                        <slot></slot>
                    </div>

                    <!-- Footer -->
                    <div class="panel-footer" v-if="$slots.footer">
                        <slot name="footer"></slot>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
interface Props {
    show: boolean;
    title?: string;
    subtitle?: string;
    showClose?: boolean;
    maxWidth?: string;
}

withDefaults(defineProps<Props>(), {
    show: false,
    showClose: true,
    maxWidth: '420px'
});

defineEmits(['close']);
</script>

<style scoped>
.side-panel-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: var(--shadow);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: flex-end;
}

.side-panel {
    width: 100%;
    height: 100%;
    background: var(--bg-primary);
    border-left: 1px solid var(--glass-border);
    display: flex;
    flex-direction: column;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
}

/* Header */
.panel-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--glass-border);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.panel-title {
    font-size: 1.25rem;
    font-weight: 800;
    margin: 0;
    color: var(--text-primary);
}

.panel-subtitle {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    margin: 0.25rem 0 0 0;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.icon-btn-small {
    padding: 0.5rem;
    border-radius: 8px;
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-btn-small:hover {
    background: var(--glass-bg);
    color: var(--text-primary);
}

/* Content */
.panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
}

/* Footer */
.panel-footer {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid var(--glass-border);
    background: rgba(var(--bg-secondary-rgb), 0.8);
    backdrop-filter: blur(8px);
}

/* Transition */
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--glass-border);
    border-radius: 10px;
}

@media (max-width: 640px) {
    .side-panel {
        max-width: 100% !important;
    }
}
</style>
