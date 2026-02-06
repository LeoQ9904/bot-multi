<template>
  <div class="identity-page">
    <header class="page-header">
      <h1>Identidad del Bot</h1>
      <p>Define cómo tu asistente de IA se presenta y se comporta.</p>
    </header>

    <div class="form-container glass">
      <div v-if="saving" class="saving-overlay">
        <div class="spinner"></div>
      </div>

      <div class="form-group">
        <label>Nombre del Bot</label>
        <input v-model="identity.name" type="text" placeholder="ej. Aether Pilot, JARVIS" class="glass-input" />
        <p class="help-text">El nombre que tu asistente usará para identificarse.</p>
      </div>

      <div class="form-group">
        <label>Mensaje de Saludo</label>
        <input v-model="identity.greeting" type="text" placeholder="ej. Hola Comandante, ¿cómo puedo ayudarte?"
          class="glass-input" />
        <p class="help-text">El primer mensaje que el bot envía cuando se inicia en Telegram.</p>
      </div>

      <div class="form-group">
        <label>Personalidad e Instrucciones</label>
        <textarea v-model="identity.personality"
          placeholder="ej. Eres un asistente profesional, siempre conciso y técnico..." class="glass-input textarea"
          rows="6"></textarea>
        <p class="help-text">Describe el comportamiento, tono y restricciones de tu IA.</p>
      </div>

      <div class="form-actions">
        <button @click="saveIdentity" :disabled="saving" class="btn btn-primary">
          {{ saving ? 'Guardando...' : 'Guardar Identidad' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIaService } from '~/services/ia.service';

const { show: showLoading, hide: hideLoading } = useLoading();
const { success, error } = useToast();
const identity = ref({
  name: '',
  greeting: '',
  personality: ''
});
const saving = ref(false);

const fetchIdentity = async () => {
  const { user } = useFirebaseAuth();
  if (!user.value) return;

  showLoading('Cargando identidad', 'Obteniendo configuración...');
  try {
    const token = await user.value.getIdToken();
    const response = await useIaService().getIdentity(token);
    if (response) {
      identity.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch identity', error);
  } finally {
    hideLoading();
  }
};

onMounted(() => {
  fetchIdentity();
});

const saveIdentity = async () => {
  const { user } = useFirebaseAuth();
  if (!user.value) return;

  saving.value = true;
  showLoading('Guardando identidad', 'Actualizando configuración...');
  try {
    const token = await user.value.getIdToken();
    const response = await useIaService().updateIdentity(identity.value, token);
    if (response) {
      success('¡Identidad guardada exitosamente!');
    }
  } catch (err) {
    console.error('Failed to save identity', err);
    error('Error al guardar la identidad');
  } finally {
    saving.value = false;
    hideLoading();
  }
};
</script>

<style scoped>
.identity-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .identity-page {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .form-container {
    padding: 1.5rem;
  }
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.form-container {
  padding: 2rem;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.glass-input {
  width: 100%;
  max-width: 100%;
  padding: 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.glass-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.textarea {
  resize: vertical;
}

.help-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: transform 0.2s;
}

.btn-primary {
  background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  background: linear-gradient(to right, var(--accent-secondary), var(--accent-primary));
}

.saving-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--glass-border);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
