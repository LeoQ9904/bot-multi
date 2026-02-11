<template>
  <div class="task-page-container">
    <!-- View Header -->
    <div class="view-header">
      <h1 class="page-title">Tareas</h1>
    </div>

    <!-- Filter Bar -->
    <TaskFilters v-model="activeFilter" />

    <!-- Sections -->
    <div class="task-sections">
      <TaskSection v-for="(group, sectionName) in filteredGroupedTasks" :key="sectionName" :title="String(sectionName)"
        :tasks="group" @start="taskStore.startTask($event.id)" @stop="taskStore.stopTask($event.id)"
        @complete="taskStore.completeTask($event.id)" @cancel="taskStore.cancelTask($event.id)" @edit="handleEditClick"
        @more="handleMoreActions" @preview="handlePreviewClick" />
    </div>

    <!-- ... empty state and FAB ... -->
    <div v-if="taskStore.tasks.length === 0" class="empty-state">
      <span class="material-symbols-outlined empty-icon">task</span>
      <p>No hay tareas pendientes. ¡Buen trabajo!</p>
    </div>

    <div class="fab-spacer"></div>
    <TaskFab @chat="handleChatTask" @manual="handleManualTask" />

    <TaskFormModal :is-open="isModalOpen" :initial-data="editingTask" @close="closeModal" @save="handleSaveTask" />

    <!-- Task Detail Modal -->
    <TaskDetailModal :is-open="isPreviewOpen" :task="previewingTask" @close="closePreview" @edit="handleEditFromPreview"
      @start="taskStore.startTask($event.id)" @stop="taskStore.stopTask($event.id)"
      @complete="handleActionAndClosePreview('complete', $event)"
      @cancel="handleActionAndClosePreview('cancel', $event)" @more="handleMoreActions" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '~/stores/task.store';
import TaskFilters from '~/components/tasks/TaskFilters.vue';
import TaskSection from '~/components/tasks/TaskSection.vue';
import TaskFab from '~/components/tasks/TaskFab.vue';
import TaskFormModal from '~/components/tasks/TaskFormModal.vue';
import TaskDetailModal from '~/components/tasks/TaskDetailModal.vue';

const taskStore = useTaskStore();

onMounted(() => {
  taskStore.fetchTasks();
});

// Modal State
const isModalOpen = ref(false);
const editingTask = ref<any>(null);

const isPreviewOpen = ref(false);
const previewingTask = ref<any>(null);

// Filters
const activeFilter = ref({
  type: 'all',
  projects: [] as string[],
  categories: [] as string[],
  sortOrder: 'desc' as 'asc' | 'desc',
  dateRange: { start: null as number | null, end: null as number | null },
  tags: [] as string[]
});

// Derived state from store with advanced filtering/sorting logic
const filteredGroupedTasks = computed(() => {
  let filtered = [...taskStore.tasks];

  // Filter by Projects
  if (activeFilter.value.projects.length > 0) {
    filtered = filtered.filter(t => t.project && activeFilter.value.projects.includes(t.project));
  }

  // Filter by Categories
  if (activeFilter.value.categories.length > 0) {
    filtered = filtered.filter(t => t.category && activeFilter.value.categories.includes(t.category));
  }

  // Filter by Date Range
  if (activeFilter.value.dateRange.start && activeFilter.value.dateRange.end) {
    filtered = filtered.filter(t =>
      t.scheduledAt >= activeFilter.value.dateRange.start! &&
      t.scheduledAt <= activeFilter.value.dateRange.end!
    );
  }

  // Filter by Tags
  if (activeFilter.value.tags.length > 0) {
    filtered = filtered.filter(t => activeFilter.value.tags.includes(t.tagColor));
  }

  // Apply Sorting
  filtered.sort((a, b) => {
    const factor = activeFilter.value.sortOrder === 'desc' ? -1 : 1;
    return (a.createdAt - b.createdAt) * factor;
  });

  // Re-group for the sections
  const groups: Record<string, typeof filtered> = {
    'Hoy': [],
    'Mañana': [],
    'Esta Semana': [],
    'Próximamente': []
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayTs = now.getTime();
  const tomorrowTs = todayTs + 86400000;
  const nextWeekTs = todayTs + (86400000 * 7);

  filtered.forEach(task => {
    const taskDate = new Date(task.scheduledAt);
    taskDate.setHours(0, 0, 0, 0);
    const taskTs = taskDate.getTime();

    if (taskTs === todayTs) {
      groups['Hoy']!.push(task);
    } else if (taskTs === tomorrowTs) {
      groups['Mañana']!.push(task);
    } else if (taskTs < nextWeekTs) {
      groups['Esta Semana']!.push(task);
    } else {
      groups['Próximamente']!.push(task);
    }
  });

  return Object.fromEntries(
    Object.entries(groups).filter(([_, group]) => group.length > 0)
  );
});

// Event Handlers
const handleChatTask = () => {
  navigateTo('/chat');
};

const handleManualTask = () => {
  editingTask.value = null;
  isModalOpen.value = true;
};

const handleEditClick = (task: any) => {
  editingTask.value = { ...task };
  isModalOpen.value = true;
};

const handleSaveTask = async (formData: any) => {
  if (editingTask.value) {
    await taskStore.updateTask(editingTask.value.id, formData);
  } else {
    await taskStore.addTask(formData);
  }
  closeModal();
};

const closeModal = () => {
  isModalOpen.value = false;
  editingTask.value = null;
};

const handlePreviewClick = (task: any) => {
  previewingTask.value = task;
  isPreviewOpen.value = true;
};

const closePreview = () => {
  isPreviewOpen.value = false;
  previewingTask.value = null;
};

const handleEditFromPreview = (task: any) => {
  editingTask.value = { ...task };
  isPreviewOpen.value = false;
  isModalOpen.value = true;
};

const handleActionAndClosePreview = async (action: 'complete' | 'cancel', task: any) => {
  if (action === 'complete') {
    await taskStore.completeTask(task.id);
  } else if (action === 'cancel') {
    await taskStore.cancelTask(task.id);
  }
  closePreview();
};

const handleMoreActions = async (task: any) => {
  const wantsToDelete = confirm('¿Deseas eliminar esta tarea?');
  if (wantsToDelete) {
    await taskStore.deleteTask(task.id);
    closePreview();
  }
};
</script>

<style scoped>
.task-page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Header */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.config-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.config-btn:hover {
  background: var(--glass-bg);
  color: var(--text-primary);
}

/* View Toggle */
.view-toggle {
  background: var(--bg-tertiary);
  padding: 4px;
  border-radius: 16px;
  display: flex;
  margin-bottom: 1.5rem;
}

.toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn.active {
  background: var(--bg-secondary);
  color: var(--accent-primary);
  box-shadow: 0 4px 12px var(--shadow);
}

/* Task Sections */
.task-sections {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* FAB Spacer */
.fab-spacer {
  height: 6rem;
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .task-page-container {
    padding: 1rem 1rem 8rem 1rem;
    /* Increased padding-bottom to see content behind navbar+FAB */
    overflow-x: hidden;
    /* Prevent horizontal overflow */
    width: 100%;
    box-sizing: border-box;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .view-header {
    margin-bottom: 1.5rem;
  }

  .view-toggle {
    margin-bottom: 1rem;
    overflow-x: auto;
    width: 100%;
    -webkit-overflow-scrolling: touch;
  }

  .toggle-btn {
    padding: 0.5rem;
    font-size: 0.8rem;
    min-width: 100px;
  }

  .task-sections {
    gap: 2rem;
  }
}

/* Extra small devices */
@media (max-width: 480px) {
  /* No specific styles left here after component extraction */
}
</style>
