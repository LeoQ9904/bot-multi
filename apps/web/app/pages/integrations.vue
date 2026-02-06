<template>
  <div class="integrations-page">
    <header class="page-header">
      <h1>Integraciones Dinámicas</h1>
      <p>Configura tus bots y servicios del espacio de trabajo.</p>
    </header>

    <div class="grid">
      <!-- Telegram Integration -->
      <section class="card glass">
        <div class="card-header">
          <div class="icon telegram">T</div>
          <h3>Telegram Bot</h3>
          <span v-if="integrations.TELEGRAM" class="status-badge connected">Conectado</span>
        </div>
        <div class="card-body">
          <div v-if="!integrations.TELEGRAM">
            <input
              v-model="telegramToken"
              type="password"
              placeholder="Token del Bot (de BotFather)"
              class="glass-input"
            />
            <button
              @click="saveIntegration('TELEGRAM', { token: telegramToken })"
              class="btn btn-primary"
            >
              Conectar Bot
            </button>
          </div>
          <div v-else class="connected-state">
            <p class="success-text">Tu bot está activo y listo.</p>
            <button
              @click="deleteIntegration(integrations.TELEGRAM.id, 'TELEGRAM')"
              class="btn btn-danger"
            >
              Desconectar Bot
            </button>
          </div>
        </div>
      </section>

      <!-- Google Integration -->
      <section class="card glass">
        <div class="card-header">
          <div class="icon google">G</div>
          <h3>Google Calendar</h3>
          <span v-if="integrations.GOOGLE" class="status-badge connected">Conectado</span>
        </div>
        <div class="card-body">
          <p class="info-text">
            Conecta tu cuenta de Google para gestionar tu calendario con Aether.
          </p>
          <button class="btn btn-secondary disabled">Conectar con Google (Próximamente)</button>
        </div>
      </section>

      <!-- Notion Integration -->
      <section class="card glass">
        <div class="card-header">
          <div class="icon notion">N</div>
          <h3>Notion</h3>
          <span v-if="integrations.NOTION" class="status-badge connected">Conectado</span>
        </div>
        <div class="card-body">
          <div v-if="!integrations.NOTION">
            <input
              v-model="notionToken"
              type="password"
              placeholder="Token de Integración Interna"
              class="glass-input"
            />
            <input
              v-model="notionDbId"
              type="text"
              placeholder="ID de Base de Datos"
              class="glass-input"
            />
            <button
              @click="saveIntegration('NOTION', { token: notionToken, databaseId: notionDbId })"
              class="btn btn-primary"
            >
              Sincronizar Notion
            </button>
          </div>
          <div v-else class="connected-state">
            <p class="success-text">Espacio de trabajo de Notion sincronizado.</p>
            <button
              @click="deleteIntegration(integrations.NOTION.id, 'NOTION')"
              class="btn btn-danger"
            >
              Desconectar Notion
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntegrationService } from '~/services/integration.service';

const telegramToken = ref('');
const notionToken = ref('');
const notionDbId = ref('');
const integrations = ref<Record<string, any>>({});

const fetchIntegrations = async () => {
  const { user } = useFirebaseAuth();
  if (!user.value) return;

  try {
    const token = await user.value.getIdToken();
    const response = await useIntegrationService().list(token);
    if (response && response.data) {
      const data = response.data;
      const map: Record<string, any> = {};
      data.forEach((i: any) => (map[i.type] = i));
      integrations.value = map;
    }
  } catch (error) {
    console.error('Failed to fetch integrations', error);
  }
};

onMounted(() => {
  fetchIntegrations();
});

const saveIntegration = async (type: string, config: any) => {
  const { user } = useFirebaseAuth();
  if (!user.value) return alert('Por favor inicia sesión primero');

  try {
    const token = await user.value.getIdToken();
    const response = await useIntegrationService().create(type, config, token);

    if (response && response.data) {
      alert(`¡Integración ${type} guardada y activada!`);
      fetchIntegrations();
    } else {
      const error = response || 'Error desconocido';
      alert(`Error: ${error.message || error}`);
    }
  } catch (error) {
    console.error('Failed to save integration', error);
    alert('Error al conectar con el servidor');
  }
};

const deleteIntegration = async (id: string, type: string) => {
  console.log('Attempting to delete integration:', { id, type });
  if (!confirm(`¿Estás seguro de que quieres desconectar ${type}?`)) return;

  const { user } = useFirebaseAuth();
  if (!user.value) return;

  try {
    const token = await user.value.getIdToken();
    const response = await useIntegrationService().delete(id, token);

    if (response) {
      alert(`${type} desconectado.`);
      fetchIntegrations();
    }
  } catch (error) {
    console.error('Failed to delete integration', error);
  }
};
</script>

<style scoped>
.integrations-page {
  padding: 2rem;
  min-height: 100vh;
  color: var(--text-primary);
}

.page-header {
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .integrations-page {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card {
    padding: 1.5rem;
  }
}

.card {
  padding: 2rem;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.telegram {
  background: #0088cc;
}
.google {
  background: #ea4335;
}
.notion {
  background: #000000;
  border: 1px solid #333;
}

.glass-input {
  width: 100%;
  max-width: 100%;
  padding: 0.75rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: var(--text-primary);
  margin-bottom: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.glass-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.glass-input::placeholder {
  color: var(--text-tertiary);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary));
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(to right, var(--accent-secondary), var(--accent-primary));
}

.btn-secondary {
  background: var(--glass-bg);
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.status-badge {
  margin-left: auto;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-weight: bold;
}

.connected {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.connected-state {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.success-text {
  color: #94a3b8;
  font-size: 0.9rem;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
}

.info-text {
  color: #94a3b8;
  font-size: 0.9rem;
}
</style>
