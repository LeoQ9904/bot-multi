<template>
  <div class="page-container dashboard-page">
    <div class="page-content">
      <HeaderPage :title="greeting + ' ' + userFirstName" :subtitle="currentDate" />

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
import { usePushNotifications } from '~/composables/usePushNotifications';
import HeaderPage from '~/components/HeaderPage.vue';

const taskStore = useTaskStore();
const noteStore = useNoteStore();
const { requestPermission } = usePushNotifications();
const { user } = useFirebaseAuth();

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

</script>

<style scoped>
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
  .dashboard-grid {
    gap: 2rem;
  }
}
</style>