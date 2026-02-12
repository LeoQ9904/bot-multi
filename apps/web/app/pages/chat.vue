<template>
  <div class="chat-container">
    <div class="chat-messages" ref="scrollContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="welcome-card glass">
          <div class="welcome-icon">✨</div>
          <h2>¡Hola! Soy Aether</h2>
          <p>
            Tu asistente de IA personalizado. Puedo ayudarte con información, análisis y tareas del
            día a día.
          </p>
          <div class="welcome-suggestions">
            <span class="suggestion">💡 Hazme una pregunta</span>
            <span class="suggestion">🔍 Busca información</span>
            <span class="suggestion">📊 Analiza datos</span>
          </div>
        </div>
      </div>

      <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
        <div class="icon-ia" v-if="msg.role === 'assistant'" style="margin-right: 5px;">
          <Logo fontSize="1.2rem" />
        </div>
        <div>
          <div style="color: var(--text-secondary); margin-bottom: 5px"
            :style="[msg.role == 'user' ? { textAlign: 'right' } : {}]">
            {{ msg.role === 'assistant' ? 'Aether' : 'Tú' }}
          </div>
          <div class="message-bubble glass">
            <div v-if="msg.role === 'assistant'" class="" v-html="output(msg.content)"></div>
            <template v-else>{{ msg.content }}</template>
          </div>
          <div v-if="msg.role === 'assistant' && msg.options && msg.options.length > 0 && index === messages.length - 1"
            class="options-container">
            <div class="" style="margin-top: 5px; display: flex; gap: 5px; flex-wrap: wrap;">
              <div @click="sendOption(option)" v-for="(option, i) in msg.options" :key="i" class="option">{{ option }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="msg.role === 'user'" style="margin-left: 5px;">
          <Avatar />
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
import Avatar from '~/components/icons/Avatar.vue';
import Logo from '~/components/icons/Logo.vue';
import { IaService } from '~/services/ia.service';
import { marked } from 'marked'
import { useTaskStore } from '~/stores/task.store';
import { useNoteStore } from '~/stores/note.store';

const { user } = useFirebaseAuth();
const input = ref('');
const isTyping = ref(false);
const scrollContainer = ref<HTMLElement | null>(null);
const messages = ref<{ role: 'user' | 'assistant'; content: string, options?: string[] }[]>([]);
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
    // En el local storage se guarda sin las opciones
    const messagesWithoutOptions = messages.value.map(msg => {
      return {
        role: msg.role,
        content: msg.content,
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesWithoutOptions));
  }
};

onMounted(() => {
  loadChatHistory();
  scrollToBottom();
});

watch(
  messages,
  () => {
    saveChatHistory();
  },
  { deep: true },
);

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
    }
  });
};

const sendOption = (option: string) => {
  input.value = option;
  sendMessage();
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
      messages.value.push({ role: 'assistant', content: response.data.response, options: response.data.options || [] });

      // Refresh data stores as the AI might have created tasks or notes
      // Ideally we should check response.data for a flag, but for now refreshing on every successful chat response is safer
      // to ensure UI is in sync.
      await Promise.all([
        useTaskStore().fetchTasks(),
        useNoteStore().fetchNotes()
      ]);

    } else {
      messages.value.push({
        role: 'assistant',
        content: 'Lo siento, encontré un error. Por favor intenta de nuevo más tarde.',
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    messages.value.push({
      role: 'assistant',
      content: 'Error de conexión. ¿Está el servidor en ejecución?',
      options: [],
    });
  } finally {
    isTyping.value = false;
    scrollToBottom();
  }
};

const output = (msg: string) => {
  return marked(msg)
};

</script>

<style scoped>
.icon-ia {
  background-color: var(--accent-primary);
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 40px !important;
  min-height: 40px !important;
  color: white;
}

.chat-container {
  height: calc(100vh - 1rem);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
}

@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 150px);
    padding: 0.5rem;
    gap: 0.75rem;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: var(--glass-border) transparent;
  min-height: 0;
}

.message {
  display: flex;
  align-items: flex-start;
  margin-top: 5px;
}

.message.user {
  justify-content: flex-end;
}

.message-bubble {
  padding: 1rem 1.25rem;
  border-radius: 18px;
  line-height: 1.5;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.option {
  padding: 0.2rem 1rem;
  border-radius: 5px;
  line-height: 1.5;
  font-size: 0.8rem;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 1px solid var(--glass-border);
  cursor: pointer;
}

@media (max-width: 768px) {
  .message-bubble {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}

.user .message-bubble {
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-top-right-radius: 4px;
}

.assistant .message-bubble {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-top-left-radius: 4px;
}

.chat-input-area {
  padding: 0.75rem 1rem;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  margin-bottom: env(safe-area-inset-bottom);
}

@media (max-width: 768px) {
  .chat-input-area {
    padding: 0.6rem 0.85rem;
    border-radius: 50px;
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

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
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
