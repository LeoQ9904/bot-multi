<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import Logo from './icons/Logo.vue';
import { useIaService } from '~/services/ia.service';
import { useIntegrationService } from '~/services/integration.service';

// Modular Settings Components
import SettingsModal from './settings/SettingsModal.vue';
import AppearanceTab from './settings/AppearanceTab.vue';
import IdentityTab from './settings/IdentityTab.vue';
import IntegrationsTab from './settings/IntegrationsTab.vue';

const { logout, user } = useFirebaseAuth();
const route = useRoute();

const isDarkMode = ref(true);
const isMobileOpen = ref(false);
const isSettingsOpen = ref(false);
const selectedTheme = ref('dark');
const currentTab = ref('appearance');

const { show: showLoading, hide: hideLoading } = useLoading();
const { success, error: toastError } = useToast();

// Identity State
const identity = ref({
  name: '',
  greeting: '',
  personality: ''
});
const isSavingIdentity = ref(false);

// Integrations State
const integrations = ref<Record<string, any>>({});

const isConnecting = ref<Record<string, boolean>>({});
const isDeleting = ref<Record<string, boolean>>({});
const confirmDeleteId = ref<string | null>(null);

const emit = defineEmits(['displayTheme']);

const menuItems = [
  { label: 'Inicio', icon: 'home', path: '/' },
  { label: 'Chat', icon: 'chat', path: '/chat' },
  { label: 'Task', icon: 'task_alt', path: '/task' },
  { label: 'Calendar', icon: 'calendar_month', path: '/calendar' },
  { label: 'Expenses', icon: 'paid', path: '/expenses' },
  { label: 'Notes', icon: 'note', path: '/notes' },
  { label: 'Insights', icon: 'analytics', path: '/insights' },
];

const themes = [
  { name: 'Oscuro', value: 'dark', color: '#0a0e1a' },
  { name: 'Claro', value: 'light', color: '#f7fafc' },
];

const isActive = (path: string) => route.path === path;

const toggleTheme = (theme: string) => {
  selectedTheme.value = theme;
  isDarkMode.value = theme === 'dark';
  localStorage.setItem('aether-theme', theme);
  emit('displayTheme', isDarkMode.value);
};

const openSettings = () => {
  isSettingsOpen.value = true;
  fetchAllSettings();
};

const closeSettings = () => {
  isSettingsOpen.value = false;
};

const fetchAllSettings = async () => {
  const { user } = useFirebaseAuth();
  if (!user.value) return;

  const token = await user.value.getIdToken();

  // Fetch Identity
  try {
    const idRes = await useIaService().getIdentity(token);
    if (idRes) identity.value = idRes.data;
  } catch (e) {
    console.error('Failed to fetch identity', e);
  }

  // Fetch Integrations
  try {
    const intRes = await useIntegrationService().list(token);
    console.log('Integrations', intRes);
    if (intRes && intRes.data) {
      const map: Record<string, any> = {};
      intRes.data.forEach((i: any) => (map[i.type] = i));
      integrations.value = map;
    }
  } catch (e) {
    console.error('Failed to fetch integrations', e);
  }
};

const saveIdentity = async (newIdentity: any) => {
  const { user } = useFirebaseAuth();
  if (!user.value) return;

  isSavingIdentity.value = true;
  try {
    const token = await user.value.getIdToken();
    await useIaService().updateIdentity(newIdentity, token);
    identity.value = { ...newIdentity };
    success('¡Identidad actualizada!');
  } catch (e) {
    toastError('Error al guardar identidad');
  } finally {
    isSavingIdentity.value = false;
  }
};

const saveIntegration = async (type: string, config: any) => {
  const { user } = useFirebaseAuth();
  if (!user.value) return;
  isConnecting.value[type] = true;
  try {
    const token = await user.value.getIdToken();
    const response = await useIntegrationService().create(type, config, token);
    integrations.value[type] = response.data;
    success(`${type} conectado exitosamente`);
  } catch (e) {
    toastError(`Error al conectar ${type}`);
  } finally {
    isConnecting.value[type] = false;
  }
};

const deleteIntegration = async (id: string, type: string) => {
  if (confirmDeleteId.value !== id) {
    confirmDeleteId.value = id;
    // Auto-reset confirm after 3 seconds
    setTimeout(() => {
      if (confirmDeleteId.value === id) confirmDeleteId.value = null;
    }, 3000);
    return;
  }

  const { user } = useFirebaseAuth();
  if (!user.value) return;

  isDeleting.value[type] = true;
  try {
    const token = await user.value.getIdToken();
    await useIntegrationService().delete(id, token);
    success(`${type} desconectado`);
    integrations.value[type] = null;
    confirmDeleteId.value = null;
  } catch (e) {
    toastError(`Error al desconectar ${type}`);
  } finally {
    isDeleting.value[type] = false;
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('aether-theme') || 'dark';
  selectedTheme.value = savedTheme;
  isDarkMode.value = savedTheme === 'dark';
});
</script>

<template>
  <div class="sidebar-wrapper">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <div class="app-brand">
        <Logo class="mobile-logo" />
        <span>Aether</span>
      </div>
      <div class="user-avatar-mobile" @click="openSettings">
        <img v-if="user?.photoURL" :src="user.photoURL || undefined" :alt="user.displayName || 'User'"
          class="avatar-img" />
        <div v-else class="avatar-fallback">
          {{ user?.displayName?.[0]?.toUpperCase() || 'U' }}
        </div>
      </div>
    </header>

    <!-- Desktop Sidebar (Hidden on Mobile) -->
    <aside class="sidebar desktop-only">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="app-brand">
          <Logo />
          <span>Aether</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <ul class="menu-list">
          <li v-for="item in menuItems" :key="item.path" class="menu-item">
            <NuxtLink :to="item.path" class="menu-link" :class="{ active: isActive(item.path) }">
              <span class="material-symbols-outlined">{{ item.icon }}</span>
              <span class="text-sm">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- User Section -->
      <div class="sidebar-user">
        <div class="user-profile">
          <img v-if="user?.photoURL" :src="user.photoURL || undefined" :alt="user.displayName || 'User'"
            class="user-avatar" />
          <div v-else class="user-avatar-fallback">
            {{ user?.displayName?.[0]?.toUpperCase() || 'U' }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ user?.displayName || 'Usuario' }}</div>
            <div class="user-email">{{ user?.email }}</div>
          </div>
        </div>

        <button @click="openSettings" class="action-btn settings-btn" title="Configuración">
          <span class="material-symbols-outlined">settings</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Footer Navigation -->
    <nav class="mobile-footer-nav">
      <ul class="mobile-menu-list">
        <li v-for="item in menuItems.slice(0, 5)" :key="item.path" class="mobile-menu-item">
          <NuxtLink :to="item.path" class="mobile-menu-link" :class="{ active: isActive(item.path) }">
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <span class="mobile-menu-label">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Refactored Settings Modal -->
    <SettingsModal :is-open="isSettingsOpen" v-model:current-tab="currentTab" @close="closeSettings" @logout="logout">
      <AppearanceTab v-if="currentTab === 'appearance'" :selected-theme="selectedTheme" :themes="themes"
        @update:theme="toggleTheme" />

      <IdentityTab v-if="currentTab === 'identity'" :identity="identity" :is-saving="isSavingIdentity"
        @save="saveIdentity" />

      <IntegrationsTab v-if="currentTab === 'integrations'" :integrations="integrations" :is-connecting="isConnecting"
        :is-deleting="isDeleting" :confirm-delete-id="confirmDeleteId" @save="saveIntegration"
        @delete="deleteIntegration" />
    </SettingsModal>
  </div>
</template>

<style scoped>
/* Mobile Header */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--glass-border);
  padding: 0 1.25rem;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
}

.mobile-logo {
  width: 32px;
  height: 32px;
}

.user-avatar-mobile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--accent-primary);
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

/* Sidebar (Desktop) */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 240px;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

/* Sidebar Header */
.sidebar-header {
  padding: 2rem 1.5rem;
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 800;
  font-size: 1.5rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Navigation Menu */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 12px;
}

.menu-link:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.menu-link.active {
  color: white;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  font-weight: 600;
  box-shadow: 0 4px 12px var(--glow);
}

/* User Section */
.sidebar-user {
  padding: 1.25rem;
  border-top: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid var(--accent-primary);
}

.user-avatar-fallback {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.user-info {
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--bg-tertiary);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--glass-bg);
  transform: translateY(-2px);
}

/* Mobile Footer Navigation */
.mobile-footer-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border-top: 1px solid var(--glass-border);
  z-index: 1000;
  padding: 0 0.5rem;
}

.mobile-menu-list {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-menu-item {
  flex: 1;
}

.mobile-menu-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: 0.7rem;
  transition: all 0.2s ease;
  height: 100%;
}

.mobile-menu-link .material-symbols-outlined {
  font-size: 1.5rem;
}

.mobile-menu-link.active {
  color: var(--accent-primary);
}

.mobile-menu-link.active .material-symbols-outlined {
  font-variation-settings: 'FILL' 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .mobile-header {
    display: flex;
  }

  .mobile-footer-nav {
    display: block;
  }
}

/* Settings Modal */
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
}

.close-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  color: var(--text-primary);
  padding: 0.5rem;
  border-radius: 8px;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Settings Modal Tabs */
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

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .mobile-header {
    display: flex;
  }

  .mobile-footer-nav {
    display: block;
  }
}
</style>
