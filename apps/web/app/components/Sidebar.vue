<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import Logo from './icons/Logo.vue';

const { logout, user } = useFirebaseAuth();
const route = useRoute();

const isDarkMode = ref(true);
const isMobileOpen = ref(false);
const isSettingsOpen = ref(false);
const selectedTheme = ref('dark');

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

const toggleMobileMenu = () => {
  isMobileOpen.value = !isMobileOpen.value;
};

const closeMobileMenu = () => {
  isMobileOpen.value = false;
};

const openSettings = () => {
  isSettingsOpen.value = true;
};

const closeSettings = () => {
  isSettingsOpen.value = false;
};

onMounted(() => {
  const savedTheme = localStorage.getItem('aether-theme') || 'dark';
  selectedTheme.value = savedTheme;
  isDarkMode.value = savedTheme === 'dark';
});
</script>

<template>
  <div class="sidebar-wrapper">
    <!-- Mobile Toggle Button -->
    <button class="mobile-toggle" @click="toggleMobileMenu">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'mobile-open': isMobileOpen }">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="app-brand">
          <Logo />
          <span>Raya</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <ul class="menu-list">
          <li v-for="item in menuItems" :key="item.path" class="menu-item">
            <NuxtLink
              :to="item.path"
              class="menu-link"
              :class="{ active: isActive(item.path) }"
              @click="closeMobileMenu"
            >
              <span class="material-symbols-outlined">{{ item.icon }}</span>
              <span class="text-sm">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- User Section -->
      <div class="sidebar-user">
        <div style="max-width: calc(100% - 30px)">
          <div class="user-profile">
            <img
              v-if="user?.photoURL"
              :src="user.photoURL"
              :alt="user.displayName"
              class="user-avatar"
            />
            <div v-else class="user-avatar-fallback">
              {{ user?.displayName?.[0]?.toUpperCase() || 'U' }}
            </div>
            <div class="user-info">
              <div class="user-name">{{ user?.displayName || 'Usuario' }}</div>
              <div class="user-email">{{ user?.email }}</div>
            </div>
          </div>
        </div>

        <!-- User Actions -->
        <button @click="openSettings" class="action-btn settings-btn" title="Configuración">
          <span class="material-symbols-outlined">settings</span>
        </button>
      </div>
    </aside>

    <!-- Settings Modal -->
    <div v-if="isSettingsOpen" class="settings-modal-overlay" @click="closeSettings">
      <div class="settings-modal" @click.stop>
        <div class="settings-header">
          <h2>Configuración</h2>
          <button class="close-btn" @click="closeSettings">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="settings-content">
          <!-- Theme Selection -->
          <div class="settings-section">
            <h3>Tema</h3>
            <div class="theme-grid">
              <button
                v-for="theme in themes"
                :key="theme.value"
                @click="toggleTheme(theme.value)"
                class="theme-option"
                :class="{ active: selectedTheme === theme.value }"
              >
                <div class="theme-preview" :style="{ backgroundColor: theme.color }"></div>
                <span>{{ theme.name }}</span>
              </button>
            </div>
          </div>

          <!-- Logout -->
          <div class="settings-section">
            <button @click="logout" class="logout-btn-modal">
              <span class="material-symbols-outlined">logout</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Overlay -->
    <div v-if="isMobileOpen" class="sidebar-overlay" @click="closeMobileMenu"></div>
  </div>
</template>

<style scoped>
.sidebar-wrapper {
  position: relative;
}

/* Mobile Toggle Button */
.mobile-toggle {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  width: 44px;
  height: 44px;
  border-radius: 12px;
  cursor: pointer;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.mobile-toggle:hover {
  background: var(--bg-tertiary);
}

.mobile-toggle span {
  width: 20px;
  height: 2.5px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Sidebar */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 220px;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: transform 0.3s ease;
}

/* Sidebar Header */
.sidebar-header {
  padding: 15px;
}

.app-brand {
  display: flex;
  align-items: center;
  justify-content: center;
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
  padding: 0 0;
}

.menu-list {
  list-style: none;
  padding: 15px;
  margin: 0;
}

.menu-item {
  margin: 0;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 1.05rem;
  transition: all 0.4s ease;
  border-radius: 10px;
}

.menu-link:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border-left-color: var(--accent-primary);
}

.menu-link.active {
  color: var(--accent-primary);
  background: var(--bg-tertiary);
  border-left-color: var(--accent-primary);
  font-weight: 800;
}

.menu-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-icons {
  font-family: 'Material Icons Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 1.5rem;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -moz-osx-font-smoothing: grayscale;
}

.menu-label {
  flex: 1;
}

/* Divider */
.sidebar-divider {
  height: 1px;
  background: var(--glass-border);
  margin: 1rem 0;
}

/* User Section */
.sidebar-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-top: 1px solid var(--glass-border);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--accent-primary);
}

.user-avatar-fallback {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* User Actions */
.action-btn {
  padding: 0.625rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.action-btn:hover {
  background: var(--glass-bg);
  transform: scale(1.05);
}

.settings-btn {
  width: 100%;
}

.settings-btn .material-icons {
  font-size: 1.25rem;
}

/* Mobile Overlay */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Responsive Design */
@media (max-width: 768px) {
  .mobile-toggle {
    display: flex;
  }

  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }

  .sidebar-overlay.hidden {
    display: none;
  }
}

/* Scrollbar Styling */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

/* Settings Modal */
.settings-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.settings-modal {
  width: 100%;
  max-width: 400px;
  height: 100vh;
  background: var(--bg-secondary);
  border-left: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
  box-shadow: -2px 0 8px var(--shadow);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
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
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  border-radius: 8px;
}

.close-btn .material-icons {
  font-size: 1.5rem;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  font-weight: 500;
}

.theme-option:hover {
  border-color: var(--accent-primary);
  background: var(--glass-bg);
}

.theme-option.active {
  border-color: var(--accent-primary);
  background: var(--glass-bg);
  box-shadow: 0 0 12px var(--glow);
}

.theme-preview {
  width: 100%;
  height: 60px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
}

.logout-btn-modal {
  width: 100%;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #ef4444;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.logout-btn-modal:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.logout-btn-modal .material-icons {
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .settings-modal {
    max-width: 100%;
  }
}
</style>
