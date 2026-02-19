<template>
  <div class="page-container dashboard-page">
    <div class="page-content">
      <!-- Header -->
      <header class="dashboard-header">
        <div>
          <h2 class="greeting-title">{{ greeting }} {{ userFirstName }}</h2>
          <p class="date-subtitle">{{ currentDate }}</p>
        </div>
        <div class="header-actions">
          <button class="icon-btn" @click="toggleTheme">
            <span class="material-symbols-outlined">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
          </button>
          <div class="notification-wrapper">
            <button class="icon-btn" @click="notificationStore.togglePanel(true)">
              <span class="material-symbols-outlined">notifications</span>
              <span class="badge" v-if="notificationStore.unreadCount > 0">{{ notificationStore.unreadCount }}</span>
            </button>
          </div>
          <div class="user-avatar">
            <img :src="userPhoto" alt="Avatar" v-if="userPhoto">
            <span class="material-symbols-outlined" v-else>person</span>
          </div>
        </div>
      </header>

      <div class="dashboard-grid">
        <!-- Left Column: Context -->
        <div class="context-column">
          <DashboardDailyContext />
        </div>

        <!-- Right Column: Tasks -->
        <div class="tasks-column">
          <DashboardRecentTasks :tasks="todaysTasks" />
        </div>
      </div>

      <!-- Bottom Section: Notes -->
      <div class="notes-section-wrapper">
        <DashboardRecentNotes :notes="recentNotes" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '~/stores/task.store';
import { useNoteStore } from '~/stores/note.store';
import { useFirebaseAuth } from '~/composables/useAuth';
import DashboardRecentTasks from '~/components/dashboard/DashboardRecentTasks.vue';
import DashboardRecentNotes from '~/components/dashboard/DashboardRecentNotes.vue';
import DashboardDailyContext from '~/components/dashboard/DashboardDailyContext.vue';
import { useNotificationStore } from '~/stores/notification.store';
import { usePushNotifications } from '~/composables/usePushNotifications';

const taskStore = useTaskStore();
const noteStore = useNoteStore();
const notificationStore = useNotificationStore();
const { requestPermission } = usePushNotifications();
const { user } = useFirebaseAuth();

// State
const isDark = ref(false); // Todo: implement proper theme store
const isNotificationsOpen = ref(false);

// Computed
const greeting = computed(() => {
  const currentHour = new Date().getHours();
  if (currentHour < 12) return 'Buenos días';
  if (currentHour < 18) return 'Buenas tardes';
  return 'Buenas noches';
});
const userFirstName = computed(() => {
  if (user.value?.displayName) {
    return user.value.displayName.split(' ')[0];
  }
  return 'Usuario';
});

const userPhoto = computed(() => user.value?.photoURL);

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: 'numeric'
  });
});

const todaysTasks = computed(() => {
  // Combine 'Hoy' + 'In Progress' for the dashboard
  // We can filter from taskStore.tasks directly
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return taskStore.tasks.filter(t => {
    // Include if it's in progress OR scheduled for today/past
    if (t.status === 'in-progress') return true;

    const tDate = new Date(t.scheduledAt);
    tDate.setHours(0, 0, 0, 0);
    return tDate.getTime() <= today.getTime() && t.status !== 'completed';
  }).sort((a, b) => {
    // In progress first
    if (a.status === 'in-progress') return -1;
    if (b.status === 'in-progress') return 1;
    return 0;
  }).slice(0, 5);
});

const recentNotes = computed(() => {
  // Sort by updatedAt desc and take 3
  return [...noteStore.notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
});

// Lifecycle
onMounted(async () => {
  await Promise.all([
    taskStore.fetchTasks(),
    noteStore.fetchNotes()
  ]);

  // Request push permission
  await requestPermission();
});

// Actions
const toggleTheme = () => {
  isDark.value = !isDark.value;
  // Implementation specific to how theme is handled globally
};

</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.greeting-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.date-subtitle {
  color: var(--text-tertiary);
  font-weight: 500;
  text-transform: capitalize;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.notification-wrapper {
  position: relative;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--accent-primary);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid var(--bg-secondary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--glass-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Grid Layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr 2fr;
    /* 1/3 for context, 2/3 for tasks */
  }
}

.context-column {
  display: flex;
  flex-direction: column;
}

.tasks-column {
  display: flex;
  flex-direction: column;
}

.notes-section-wrapper {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .greeting-title {
    font-size: 1.5rem;
  }

  .dashboard-header {
    margin-bottom: 2rem;
  }

  .dashboard-grid {
    gap: 2rem;
  }

  .header-actions {
    display: none;
  }
}
</style>