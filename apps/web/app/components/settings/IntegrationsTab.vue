<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    integrations: Record<string, any>;
    isConnecting: Record<string, boolean>;
    isDeleting: Record<string, boolean>;
    confirmDeleteId: string | null;
}>();

const emit = defineEmits(['save', 'delete']);

const telegramToken = ref('');
const notionToken = ref('');
const notionDbId = ref('');

const getIntegrationIcon = (type: string) => {
    if (props.isDeleting[type]) return 'sync';
    const integration = props.integrations[type];
    if (props.confirmDeleteId === integration?.id) return 'warning';
    return 'delete';
};

const getIntegrationText = (type: string) => {
    if (props.isDeleting[type]) return 'Eliminando...';
    const integration = props.integrations[type];
    if (props.confirmDeleteId === integration?.id) return '¿Estás seguro?';
    return 'Desconectar';
};

const onSave = (type: string) => {
    const config = type === 'TELEGRAM'
        ? { token: telegramToken.value }
        : { token: notionToken.value, databaseId: notionDbId.value };

    emit('save', type, config);

    // Note: Parent should handle clearing tokens on success
};
</script>

<template>
    <div class="tab-pane">
        <div class="settings-section">
            <!-- Telegram -->
            <div class="integration-item glass">
                <div class="int-header">
                    <div class="int-icon telegram">T</div>
                    <div class="int-info">
                        <h4>Telegram Bot</h4>
                        <span :class="integrations.TELEGRAM ? 'status-on' : 'status-off'">
                            {{ integrations.TELEGRAM ? 'Conectado' : 'Desconectado' }}
                        </span>
                    </div>
                </div>

                <div v-if="!integrations.TELEGRAM" class="int-actions">
                    <div class="form-group-sm">
                        <label class="compact-label">Bot Token</label>
                        <input v-model="telegramToken" type="password" class="glass-input"
                            placeholder="ej. 123456:ABC-DEF..." :disabled="isConnecting.TELEGRAM" />
                        <p class="form-help">Obtén esto hablando con @BotFather en Telegram.</p>
                    </div>
                    <button @click="onSave('TELEGRAM')" class="btn btn-primary btn-sm w-full"
                        :disabled="isConnecting.TELEGRAM">
                        <span class="material-symbols-outlined button-icon-sm"
                            :class="{ spinning: isConnecting.TELEGRAM }">
                            {{ isConnecting.TELEGRAM ? 'sync' : 'link' }}
                        </span>
                        <span>{{ isConnecting.TELEGRAM ? 'Conectando...' : 'Conectar Bot' }}</span>
                    </button>
                </div>

                <div v-else class="int-actions">
                    <button @click="$emit('delete', integrations.TELEGRAM.id, 'TELEGRAM')"
                        class="btn btn-danger btn-sm w-full"
                        :class="{ 'btn-confirm': confirmDeleteId === integrations.TELEGRAM.id }"
                        :disabled="isDeleting.TELEGRAM">
                        <span class="material-symbols-outlined button-icon-sm"
                            :class="{ spinning: isDeleting.TELEGRAM }">
                            {{ getIntegrationIcon('TELEGRAM') }}
                        </span>
                        <span>{{ getIntegrationText('TELEGRAM') }}</span>
                    </button>
                </div>
            </div>

            <!-- Notion -->
            <div class="integration-item glass">
                <div class="int-header">
                    <div class="int-icon notion">N</div>
                    <div class="int-info">
                        <h4>Notion</h4>
                        <span :class="integrations.NOTION ? 'status-on' : 'status-off'">
                            {{ integrations.NOTION ? 'Conectado' : 'Desconectado' }}
                        </span>
                    </div>
                </div>

                <div v-if="!integrations.NOTION" class="int-actions">
                    <div class="form-group-sm">
                        <label class="compact-label">Integration Token</label>
                        <input v-model="notionToken" type="password" class="glass-input" placeholder="ej. secret_..."
                            :disabled="isConnecting.NOTION" />
                    </div>
                    <div class="form-group-sm">
                        <label class="compact-label">Database ID</label>
                        <input v-model="notionDbId" type="text" class="glass-input" placeholder="ej. abc123..."
                            :disabled="isConnecting.NOTION" />
                        <p class="form-help">Asegúrate de compartir tu DB con la integración.</p>
                    </div>
                    <button @click="onSave('NOTION')" class="btn btn-primary btn-sm w-full"
                        :disabled="isConnecting.NOTION">
                        <span class="material-symbols-outlined button-icon-sm"
                            :class="{ spinning: isConnecting.NOTION }">
                            {{ isConnecting.NOTION ? 'sync' : 'sync' }}
                        </span>
                        <span>{{ isConnecting.NOTION ? 'Sincronizando...' : 'Sincronizar' }}</span>
                    </button>
                </div>

                <div v-else class="int-actions">
                    <button @click="$emit('delete', integrations.NOTION.id, 'NOTION')"
                        class="btn btn-danger btn-sm w-full"
                        :class="{ 'btn-confirm': confirmDeleteId === integrations.NOTION.id }"
                        :disabled="isDeleting.NOTION">
                        <span class="material-symbols-outlined button-icon-sm" :class="{ spinning: isDeleting.NOTION }">
                            {{ getIntegrationIcon('NOTION') }}
                        </span>
                        <span>{{ getIntegrationText('NOTION') }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.integration-item {
    padding: 1.25rem;
    border-radius: 16px;
    margin-bottom: 1rem;
}

.int-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

.int-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    color: white;
}

.int-icon.telegram {
    background: #0088cc;
}

.int-icon.notion {
    background: #000;
    border: 1px solid #333;
}

.int-info h4 {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-primary);
}

.status-on {
    font-size: 0.75rem;
    color: #4ade80;
    font-weight: 600;
}

.status-off {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    font-weight: 600;
}

.int-actions {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-group-sm {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.compact-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.glass-input {
    width: 100%;
    padding: 1rem;
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.95rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
}

.glass-input:hover {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.2);
}

.glass-input:focus {
    outline: none;
    background: var(--bg-secondary);
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.btn-sm {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
}

.button-icon-sm {
    font-size: 1.1rem;
    margin-right: 0.4rem;
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.btn-confirm {
    background: #ef4444 !important;
    color: white !important;
    border-color: #ef4444 !important;
    animation: pulse-danger 1.5s infinite;
}

@keyframes pulse-danger {
    0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
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

.w-full {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
