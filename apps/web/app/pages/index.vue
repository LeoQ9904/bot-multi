<template>
  <div class="chat-container">
    <div class="chat-messages" ref="scrollContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="welcome-card glass">
          <div class="welcome-icon">✨</div>
          <h2>¡Hola! Soy Aether</h2>
          <p>Tu asistente de IA personalizado. Puedo ayudarte con información, análisis y tareas del día a día.</p>
          <div class="welcome-suggestions">
            <span class="suggestion">💡 Hazme una pregunta</span>
            <span class="suggestion">🔍 Busca información</span>
            <span class="suggestion">📊 Analiza datos</span>
          </div>
        </div>
      </div>

      <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
        <div class="message-bubble glass">
          {{ msg.content }}
        </div>
      </div>

      <div v-if="isTyping" class="message assistant">
        <div class="message-bubble glass typing">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <div class="chat-input-area glass">
      <input v-model="input" @keyup.enter="sendMessage" placeholder="Escribe tu mensaje..." :disabled="isTyping"
        class="chat-input" />
      <button @click="sendMessage" :disabled="!input || isTyping" class="send-btn">
        <svg viewBox="0 0 24 24" class="icon">
          <path d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2z" fill="currentColor" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IaService } from '~/services/ia.service';
const { user } = useFirebaseAuth();
const input = ref('');
const isTyping = ref(false);
const scrollContainer = ref<HTMLElement | null>(null);
const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([]);

const STORAGE_KEY = 'aether-chat-history';

const loadChatHistory = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        messages.value = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
  }
};

const saveChatHistory = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value));
  }
};

onMounted(() => {
  loadChatHistory();
  scrollToBottom();
});

watch(messages, () => {
  saveChatHistory();
}, { deep: true });

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  if (!input.value || isTyping.value) return;

  const userMsg = input.value;
  messages.value.push({ role: 'user', content: userMsg });
  input.value = '';
  isTyping.value = true;
  scrollToBottom();

  try {
    const token = await user.value?.getIdToken();
    const response = await IaService.chat(userMsg, 'main', token!);
    if (response) {
      messages.value.push({ role: 'assistant', content: response.data.response });
    } else {
      messages.value.push({ role: 'assistant', content: 'Lo siento, encontré un error. Por favor intenta de nuevo más tarde.' });
    }
  } catch (error) {
    console.error('Chat error:', error);
    messages.value.push({ role: 'assistant', content: 'Error de conexión. ¿Está el servidor en ejecución?' });
  } finally {
    isTyping.value = false;
    scrollToBottom();
  }
};
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 6rem);
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

@media (max-width: 768px) {
  .chat-container {
    padding: 0.5rem;
    height: 100dvh;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding-top: 5rem;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 2rem;
  scrollbar-width: thin;
  scrollbar-color: var(--glass-border) transparent;
}

@media (max-width: 768px) {
  .chat-messages {
    padding-bottom: 5rem;
  }
}

.message {
  margin-bottom: 1.5rem;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message-bubble {
  padding: 1rem 1.25rem;
  max-width: 80%;
  border-radius: 18px;
  line-height: 1.5;
  font-size: 0.95rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .message-bubble {
    max-width: 90%;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}

.user .message-bubble {
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-bottom-right-radius: 4px;
}

.assistant .message-bubble {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-bottom-left-radius: 4px;
}

.chat-input-area {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .chat-input-area {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0.5rem;
    padding: 0.5rem 0.75rem;
    z-index: 100;
  }
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 0.5rem;
  outline: none;
  font-size: 0.95rem;
}

.chat-input::placeholder {
  color: var(--text-tertiary);
}

.send-btn {
  background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  width: 20px;
  height: 20px;
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-card {
  padding: 2rem;
  border-radius: 24px;
  text-align: center;
  max-width: 500px;
}

@media (max-width: 768px) {
  .welcome-card {
    padding: 1.5rem;
    margin: 0 0.5rem;
  }
}

.welcome-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.welcome-card h2 {
  background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.75rem;
  font-size: 1.75rem;
}

@media (max-width: 768px) {
  .welcome-card h2 {
    font-size: 1.5rem;
  }
}

.welcome-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.welcome-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}

.suggestion {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .suggestion {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

.typing {
  display: flex;
  gap: 4px;
  padding: 0.75rem 1rem;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--text-secondary);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-6px);
  }
}
</style>
