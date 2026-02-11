<template>
  <div class="task-page-container">
    <!-- View Header -->
    <div class="view-header">
      <h1 class="page-title">Tareas</h1>
    </div>

    <!-- Filter Bar -->
    <TaskFilters v-model="activeFilter" :filters="filters" />

    <!-- Sections -->
    <div class="task-sections">
      <TaskSection v-for="(group, sectionName) in groupedTasks" :key="sectionName" :title="String(sectionName)"
        :tasks="group" @start="handleStartTask" @edit="handleEditTask" @more="handleMoreActions" />
    </div>

    <!-- Spacer for FAB -->
    <div class="fab-spacer"></div>

    <!-- Floating Action Button -->
    <TaskFab @click="handleNewTask" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TaskFilters from '~/components/tasks/TaskFilters.vue';
import TaskSection from '~/components/tasks/TaskSection.vue';
import TaskFab from '~/components/tasks/TaskFab.vue';

// Filters
const activeFilter = ref('Todas');
const filters = ['Todas', 'Prioridad', 'Fecha', 'Etiquetas'];

// Example data
const tasks = ref([
  {
    id: 1,
    title: 'Revisión de diseño UI Raya App',
    project: 'Branding 2024',
    section: 'Hoy',
    priority: 2,
    tagColor: 'red',
    duration: '45 min'
  },
  {
    id: 2,
    title: 'Preparar reporte de métricas Q3',
    project: 'Operaciones',
    section: 'Hoy',
    priority: 3,
    tagColor: 'amber',
    duration: '2h'
  },
  {
    id: 3,
    title: 'Feedback sesión con equipo creativo',
    project: null,
    section: 'Mañana',
    priority: 1,
    tagColor: 'emerald',
    duration: '30 min'
  },
  {
    id: 4,
    title: 'Planificación estratégica de contenidos v2',
    project: null,
    section: 'Esta Semana',
    priority: 2,
    tagColor: 'emerald',
    duration: '1.5h'
  }
]);

// Grouping logic
const groupedTasks = computed(() => {
  const groups: Record<string, typeof tasks.value> = {};

  // Define order of sections
  const sections = ['Hoy', 'Mañana', 'Esta Semana'];
  sections.forEach(s => groups[s] = []);

  tasks.value.forEach(task => {
    const s = task.section;
    if (!groups[s]) {
      groups[s] = [];
    }
    groups[s].push(task);
  });

  // Remove empty sections if any
  return Object.fromEntries(
    Object.entries(groups).filter(([_, group]) => group.length > 0)
  );
});

// Event Handlers
const handleStartTask = (task: any) => {
  console.log('Starting task:', task.title);
};

const handleEditTask = (task: any) => {
  console.log('Editing task:', task.title);
};

const handleMoreActions = (task: any) => {
  console.log('More actions for task:', task.title);
};

const handleNewTask = () => {
  console.log('Opening new task chat...');
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
