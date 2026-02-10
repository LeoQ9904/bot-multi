<script setup lang="ts">
const props = defineProps<{
    isOpen: boolean;
    currentTab: string;
}>();

const emit = defineEmits(['close', 'update:currentTab', 'logout']);
</script>

<template>
    <div v-if="isOpen" class="settings-modal-overlay" @click="$emit('close')">
        <div class="settings-modal" @click.stop>
            <div class="settings-header">
                <h2>Configuración</h2>
                <button class="close-btn" @click="$emit('close')">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div class="settings-content">
                <!-- Tabs Navigation -->
                <div class="settings-tabs">
                    <button @click="$emit('update:currentTab', 'appearance')" class="tab-btn"
                        :class="{ active: currentTab === 'appearance' }">
                        <span class="material-symbols-outlined">palette</span>
                        <span>Apariencia</span>
                    </button>
                    <button @click="$emit('update:currentTab', 'identity')" class="tab-btn"
                        :class="{ active: currentTab === 'identity' }">
                        <span class="material-symbols-outlined">badge</span>
                        <span>Identidad</span>
                    </button>
                    <button @click="$emit('update:currentTab', 'integrations')" class="tab-btn"
                        :class="{ active: currentTab === 'integrations' }">
                        <span class="material-symbols-outlined">rocket_launch</span>
                        <span>Servicios</span>
                    </button>
                </div>

                <!-- Dynamic Content Slot -->
                <slot></slot>
            </div>

            <!-- Pinned Bottom: Logout -->
            <div class="settings-footer">
                <button @click="$emit('logout')" class="logout-btn-modal">
                    <span class="material-symbols-outlined">logout</span>
                    Cerrar sesión
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.settings-modal {
    width: 100%;
    max-width: 400px;
    height: 100vh;
    background: var(--bg-secondary);
    border-left: 1px solid var(--glass-border);
    display: flex;
    flex-direction: column;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
}

.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--glass-border);
}

.settings-header h2 {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin: 0;
}

.close-btn {
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    cursor: pointer;
    color: var(--text-primary);
    padding: 0.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.settings-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
}

.settings-tabs {
    display: flex;
    background: var(--bg-tertiary);
    padding: 4px;
    border-radius: 12px;
    margin-bottom: 2rem;
    gap: 4px;
}

.tab-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    font-size: 0.7rem;
    font-weight: 600;
}

.tab-btn .material-symbols-outlined {
    font-size: 1.25rem;
}

.tab-btn:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
    background: var(--glass-bg);
    color: var(--accent-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.settings-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--glass-border);
    background: var(--bg-secondary);
}

.logout-btn-modal {
    width: 100%;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 14px;
    color: #ef4444;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.2s ease;
}

.logout-btn-modal:hover {
    background: rgba(239, 68, 68, 0.2);
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .settings-modal {
        max-width: 100%;
    }
}
</style>
