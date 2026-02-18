<template>
  <div class="task-page-layout">
    <main class="main-content custom-scrollbar">

      <HeaderPage title="Mis Tareas" subtitle="Acciones rápidas habilitadas" />

      <TaskFilters v-model="activeFilter" style="margin-bottom: 1rem;" />

      <div class="header-stats-row">
        <div class="quick-dates custom-scrollbar">
          <button v-for="day in weekDays" :key="day.date.getTime()" class="date-btn"
            :class="{ 'active': activeSelectDay && isSameDay(activeSelectDay, day.date), 'has-tasks': day.hasTasks }"
            @click="handleDateClick(day.date)">
            <span class="day-label">{{ day.label }}</span>
            <span class="day-number">{{ day.number }}</span>
            <span v-if="day.hasTasks" class="dot-indicator"></span>
          </button>
        </div>

        <div class="divider-v"></div>

        <div class="sprint-progress">
          <div class="progress-labels">
            <span class="progress-title">Progreso</span>
            <span class="progress-value">{{ sprintProgress }}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: sprintProgress + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="sections-container pb-32">
        <TaskSection v-for="(group, sectionName) in filteredGroupedTasks" :key="sectionName"
          :title="String(sectionName)" :tasks="group" @start="startTask($event.id)" @stop="stopTask($event.id)"
          @complete="completeTask($event.id)" @cancel="cancelTask($event.id)" @edit="handleEditClick"
          @more="handleMoreActions" @preview="handlePreviewClick" />
      </div>

      <!-- Enhanced empty state -->
      <EmptyPage @manual="handleManualTask" @chat="handleChatTask" v-if="taskStore.tasks.length === 0"
        title="¿Listo para empezar tu día?"
        subtitle="Aún no tienes tareas por aquí. Organiza tus pendientes y deja que Aether te ayude a ser más productivo."
        manualText="Crear mi primera tarea" chatText="Chat con Aether" />

      <!-- Floating Bottom Actions -->
      <FabNew @chat="handleChatTask" @manual="handleManualTask" iaText="Tarea por Chat" manualText="Manual" />
    </main>

    <!-- Right Sidebar -->
    <aside class="right-aside">
      <div class="insight-card" v-if="insightText">
        <div class="insight-header">
          <span class="material-symbols-outlined">analytics</span>
          <span class="insight-label">IA Insight</span>
        </div>
        <div v-html="insightText" class="insight-text"></div>
      </div>

      <div class="metrics-section">
        <h3 class="aside-section-title">Métricas de Hoy</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-value">{{ hoursToday }} </span>
            <span class="metric-label">Trabajo Estimado</span>
          </div>
          <div class="metric-card">
            <span class="metric-value">{{ taskCompleted }}</span>
            <span class="metric-label">Tareas Completadas</span>
          </div>
        </div>
      </div>

      <div class="events-section">
        <h3 class="aside-section-title">Próximos Eventos</h3>
        <div class="events-list">
          <div v-for="event in taskPending" :key="event.id" class="event-item">
            <div class="event-indicator" :style="{ background: event.tagColor }"></div>
            <div class="event-info">
              <p class="event-name">{{ event.title }}</p>
              <p class="event-time">{{ formatStartAt(event.scheduledAt, event.duration) }}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <TaskFormModal :is-open="isModalOpen" :initial-data="editingTask" @close="closeModal" @save="handleSaveTask" />
    <TaskDetailModal :is-open="isPreviewOpen" :task="previewingTask" @close="closePreview" @edit="handleEditFromPreview"
      @start="startTask($event.id)" @stop="stopTask($event.id)"
      @complete="handleActionAndClosePreview('complete', $event)"
      @cancel="handleActionAndClosePreview('cancel', $event)" @more="handleMoreActions" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaskStore } from '~/stores/task.store';
import { useTaskActions } from '~/composables/useTaskActions';
import TaskFilters from '~/components/tasks/TaskFilters.vue';
import TaskSection from '~/components/tasks/TaskSection.vue';
import TaskFormModal from '~/components/tasks/TaskFormModal.vue';
import TaskDetailModal from '~/components/tasks/TaskDetailModal.vue';
import HeaderPage from '~/components/HeaderPage.vue';
import FabNew from '~/components/FabNew.vue';
import EmptyPage from '~/components/EmptyPage.vue';
import { isBefore, isPast, isSameWeek, isThisWeek, isToday, isTomorrow, isYesterday, subWeeks, startOfWeek, addDays, format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { IaService } from '~/services/ia.service';
import { useFirebaseAuth } from '~/composables/useAuth';

const { user } = useFirebaseAuth();
const taskStore = useTaskStore();
const route = useRoute();
const router = useRouter();

const {
  openNewTask,
  openEditTask,
  openViewTask,
  handleStart: startTask,
  handleStop: stopTask,
  handleComplete: completeTask,
  handleCancel: cancelTask,
  handleDelete: deleteTask,
  handleSaveTask: saveTaskAction,
  handleClose
} = useTaskActions();

const activeSelectDay = ref<Date | null>();
const isModalOpen = ref(false);
const editingTask = ref<any>(null);
const isPreviewOpen = ref(false);
const previewingTask = ref<any>(null);
const showFilters = ref(false);
const insightText = ref('');

const activeFilter = ref({
  type: 'all',
  projects: [] as string[],
  categories: [] as string[],
  sortOrder: 'desc' as 'asc' | 'desc',
  sortBy: 'scheduledAt' as 'createdAt' | 'scheduledAt',
  dateRange: { start: null as string | null, end: null as string | null },
  tags: [] as string[]
});

const weekDays = computed(() => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentDay = startOfDay(new Date());
  return Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(start, i);
    return {
      date: d,
      label: isSameDay(d, currentDay) ? 'Hoy' : format(d, 'eee', { locale: es }),
      number: format(d, 'd'),
      hasTasks: taskStore.tasks.some(t => isSameDay(t.scheduledAt, d) && t.status === 'pending'),
    };
  });
});

const sprintProgress = computed(() => {
  if (filteredGroupedTasks.value && Object.keys(filteredGroupedTasks.value).length === 0) return 0;
  const completedTasks = Object.values(filteredGroupedTasks.value).flat().filter(t => t.status === 'completed').length;
  const totalTasks = Object.values(filteredGroupedTasks.value).flat().length;
  return Math.round((completedTasks / totalTasks) * 100);
});

// Check for 'new' or 'edit' in query
const handleQueryActions = () => {
  if (route.query.new !== undefined) {
    editingTask.value = null;
    isModalOpen.value = true;
  } else if (route.query.edit) {
    const task = taskStore.tasks.find(t => String(t.id) === String(route.query.edit));
    if (task) {
      editingTask.value = { ...task };
      isModalOpen.value = true;
    } else if (taskStore.tasks.length > 0) {
      closeModal();
    }
  } else if (route.query.view) {
    const task = taskStore.tasks.find(t => String(t.id) === String(route.query.view));
    if (task) {
      isPreviewOpen.value = true;
      previewingTask.value = task;
    } else if (taskStore.tasks.length > 0) {
      closePreview();
    }
  } else {
    isModalOpen.value = false;
    editingTask.value = null;
    isPreviewOpen.value = false;
    previewingTask.value = null;
  }
};

// Sync URL Query to Filter State
const syncUrlToFilters = () => {
  const query = route.query;
  const filter = activeFilter.value;

  if (query.type) filter.type = query.type as string;
  if (query.projects) filter.projects = (Array.isArray(query.projects) ? query.projects : [query.projects]) as string[];
  if (query.categories) filter.categories = (Array.isArray(query.categories) ? query.categories : [query.categories]) as string[];
  if (query.sortOrder) filter.sortOrder = query.sortOrder as any;
  if (query.sortBy) filter.sortBy = query.sortBy as any;
  if (query.start_date) filter.dateRange.start = query.start_date as string;
  if (query.end_date) filter.dateRange.end = query.end_date as string;
  if (query.tags) filter.tags = (Array.isArray(query.tags) ? query.tags : [query.tags]) as string[];
  showFilters.value = query.show_filters === 'true';

  if (query.start_date && query.end_date) {
    const foundDay = weekDays.value.find(day =>
      startOfDay(day.date).toISOString() === query.start_date &&
      endOfDay(day.date).toISOString() === query.end_date
    );
    activeSelectDay.value = foundDay ? foundDay.date : null;
  } else {
    activeSelectDay.value = null;
  }
};

// Sync Filter State to URL Query
const syncFiltersToUrl = () => {
  const query = { ...route.query };
  const sync = (key: string, val: any, defaultVal?: any) => {
    if (val && val !== defaultVal && (!Array.isArray(val) || val.length > 0)) query[key] = val;
    else delete query[key];
  };

  sync('type', activeFilter.value.type, 'all');
  sync('projects', activeFilter.value.projects);
  sync('categories', activeFilter.value.categories);
  sync('sortOrder', activeFilter.value.sortOrder, 'desc');
  sync('sortBy', activeFilter.value.sortBy, 'scheduledAt');
  sync('start_date', activeFilter.value.dateRange.start);
  sync('end_date', activeFilter.value.dateRange.end);
  sync('tags', activeFilter.value.tags);

  if (showFilters.value) query.show_filters = 'true';
  else delete query.show_filters;

  if (JSON.stringify(query) !== JSON.stringify(route.query)) {
    router.replace({ query });
  }
};

onMounted(async () => {
  await taskStore.fetchTasks();
  syncUrlToFilters();
  handleQueryActions();
  await recomendationAI();
});

watch(activeFilter, () => syncFiltersToUrl(), { deep: true });
watch(showFilters, () => syncFiltersToUrl());
watch(() => route.query, () => {
  syncUrlToFilters();
  handleQueryActions();
}, { deep: true });


const handleChatTask = () => { navigateTo({ path: '/chat', query: { initialMessage: 'Hola! Ayúdame con una tarea: ' } }); };
const handleManualTask = () => openNewTask();
const handleEditClick = (task: any) => openEditTask(task.id);

const handleSaveTask = async (formData: any) => {
  await saveTaskAction(formData, editingTask.value);
  closeModal();
};

const closeModal = () => { handleClose(); };

const handlePreviewClick = (task: any) => openViewTask(task.id);
const closePreview = () => { handleClose(); isPreviewOpen.value = false; previewingTask.value = null; };
const handleEditFromPreview = (task: any) => { closePreview(); openEditTask(task.id) };

const handleActionAndClosePreview = async (action: 'complete' | 'cancel', task: any) => {
  if (action === 'complete') await completeTask(task.id);
  else if (action === 'cancel') await cancelTask(task.id);
  closePreview();
};

const handleMoreActions = async (task: any) => {
  const deleted = await deleteTask(task.id);
  if (deleted) closePreview();
};

const handleDateClick = (date: Date) => {
  if (activeSelectDay.value && isSameDay(activeSelectDay.value, date)) {
    activeSelectDay.value = null;
    activeFilter.value.dateRange.start = null;
    activeFilter.value.dateRange.end = null;
    return;
  }
  activeSelectDay.value = date;
  activeFilter.value.dateRange.start = startOfDay(date).toISOString();
  activeFilter.value.dateRange.end = endOfDay(date).toISOString();
};

const filteredGroupedTasks = computed(() => {
  let filtered = [...taskStore.tasks];
  if (activeFilter.value.projects.length > 0) filtered = filtered.filter(t => t.project && activeFilter.value.projects.includes(t.project));
  if (activeFilter.value.categories.length > 0) filtered = filtered.filter(t => t.category && activeFilter.value.categories.includes(t.category));
  if (activeFilter.value.dateRange.start && activeFilter.value.dateRange.end) {
    const startTs = new Date(activeFilter.value.dateRange.start).getTime();
    const endTs = new Date(activeFilter.value.dateRange.end).getTime();
    filtered = filtered.filter(t => new Date(t.scheduledAt).getTime() >= startTs && new Date(t.scheduledAt).getTime() <= endTs);
  }
  if (activeFilter.value.tags.length > 0) filtered = filtered.filter(t => activeFilter.value.tags.includes(t.tagColor));

  filtered.sort((a, b) => {
    const factor = activeFilter.value.sortOrder === 'desc' ? -1 : 1;
    const sortField = activeFilter.value.sortBy;
    return (a[sortField] - b[sortField]) * factor;
  });

  const groups: Record<string, typeof filtered> = { 'Hoy': [], 'Mañana': [], 'Esta Semana': [], 'Ayer': [], 'Próximamente': [], 'Semana pasada': [], 'Más antiguas': [] };
  const dateHoy = new Date();
  filtered.forEach(task => {
    const taskTs = task.scheduledAt;
    if (isToday(taskTs)) groups['Hoy']!.push(task);
    else if (isYesterday(taskTs)) groups['Ayer']!.push(task);
    else if (isBefore(taskTs, dateHoy.getTime()) && isSameWeek(taskTs, subWeeks(dateHoy.getTime(), 1))) groups['Semana pasada']!.push(task);
    else if (isTomorrow(taskTs)) groups['Mañana']!.push(task);
    else if (isThisWeek(taskTs)) groups['Esta Semana']!.push(task);
    else if (isPast(taskTs)) groups['Más antiguas']!.push(task);
    else groups['Próximamente']!.push(task);
  });
  return Object.fromEntries(Object.entries(groups).filter(([_, group]) => group.length > 0));
});

// calculo de las horas de hoy
const hoursToday = computed(() => {
  const tasksToday = taskStore.tasks.filter(task => isToday(task.scheduledAt));
  const totalHours = tasksToday.reduce((acc, task) => acc + minutesValue(task.duration), 0);

  const horas = Math.floor(totalHours / 60);
  const minutosRestantes = totalHours % 60;

  return `${horas}.${minutosRestantes.toString().padStart(2, '0')} h`;
});

const taskCompleted = computed(() => {
  const tasksToday = taskStore.tasks.filter(task => isToday(task.scheduledAt));
  const completedTasks = tasksToday.filter(task => task.completedAt && task.status === 'completed');
  return `${completedTasks.length}/${tasksToday.length}`;
});

const taskPending = computed(() => {
  const tasksToday = taskStore.tasks.filter(task => isToday(task.scheduledAt));
  const pendingTasks = tasksToday.filter(task => task.status !== 'completed');
  return pendingTasks;
});

const minutesValue = (val: string): number => {
  const minutes = val.split(' ')[0] || '0';
  return parseInt(minutes);
}

const formatStartAt = (date: number, duration: string) => {
  const dateObj = new Date(date);
  const minutes = minutesValue(duration);
  const dateObjEnd = new Date(date);
  dateObjEnd.setMinutes(dateObjEnd.getMinutes() + minutes);
  return `${dateObj.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${dateObjEnd.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

const recomendationAI = async () => {
  try {
    const prompt = `
      Estas son las tareas del día del usuario: ${taskPending.value}
      Quiero que me retornes un string de aproximadamente 150 caracteres donde me recomiendes con que tarea inidicar o concejos al respecto.
      **IMPORTANT**: Ten en cuenta  que el listado de las tareas son las que el usuario tiene pendientes por realizar.
      Retorne en formato html con sobreado sobre los datos que consideres importantes, como los titulos de las tareas.
      **IMPORTANT**: El horario de scheduledAt es en formato toISOString(). Es importante que conviertas las horas a formato UTC-5 Bogota.
      **IMPORTANT**: No retornes el formato de hora ejemplo 9:00 a.m (UTC-5), no es necesario, solo retornar 9:00 a.m.
    `;
    const token = await user.value?.getIdToken();
    const response = await IaService.chat(prompt, 'recomendation', token || '');
    insightText.value = response.data.response;
  } catch (error) {
    console.log(error);
  }
}

</script>

<style scoped>
.task-page-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  background: var(--bg-primary);
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  padding: 2rem;
}

.header-section {
  padding: 2rem 2rem 1rem 2rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-outline-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-outline-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.header-stats-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.quick-dates {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.date-btn {
  flex-shrink: 0;
  width: 3rem;
  height: 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.date-btn.active {
  background: var(--accent-primary);
  color: #fff;
  box-shadow: 0 4px 12px var(--glow);
}

.date-btn.active .day-label {
  color: rgba(255, 255, 255, 0.7);
}

.day-label {
  font-size: 0.625rem;
  text-transform: uppercase;
  font-weight: 700;
}

.day-number {
  font-size: 1.125rem;
  font-weight: 700;
}

.dot-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 0.375rem;
  height: 0.375rem;
  background: var(--accent-red);
  border-radius: 50%;
}

.divider-v {
  width: 1px;
  height: 2.5rem;
  background: var(--glass-border);
}

.sprint-progress {
  flex: 1;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-title {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.progress-value {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.progress-bar-container {
  height: 0.375rem;
  background: var(--glass-bg);
  border-radius: 1rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 1rem;
  box-shadow: 0 0 12px var(--glow);
}

.header-container-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.filters-wrapper {
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 1.25rem;
  padding: 1.25rem;
  margin-bottom: 2rem;
}

/* Floating Actions */
.floating-actions-bar {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  padding: 0.375rem;
  border-radius: 1.25rem;
  background: rgba(var(--bg-secondary-rgb), 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 20px 40px var(--shadow);
  z-index: 100;
}

.ai-new-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-primary);
  color: #fff;
  border-radius: 0.875rem;
  border: none;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px var(--glow);
  transition: all 0.2s;
}

.ai-new-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

.manual-add-btn {
  width: 3.25rem;
  height: 3.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-tertiary);
  border-radius: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.manual-add-btn:hover {
  background: var(--glass-bg);
  color: var(--text-primary);
}

/* Right Sidebar */
.right-aside {
  width: 20rem;
  background: var(--bg-primary);
  border-left: 1px solid var(--glass-border);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.insight-card {
  padding: 0.5rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
}

.insight-label {
  font-size: 0.625rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.insight-text {
  font-size: 0.7rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.insight-text .highlight {
  color: var(--text-primary);
  font-weight: 600;
}

.aside-section-title {
  font-size: 0.6875rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.metric-card {
  padding: 1rem;
  border-radius: 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.metric-label {
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: -0.01em;
}

.events-list {
  max-height: 55vh;
  overflow-y: auto;
}

.event-item {
  display: flex;
  gap: 1rem;
}

.event-indicator {
  width: 0.25rem;
  height: 2.5rem;
  border-radius: 1rem;
}

.event-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.event-time {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  margin-top: 0.125rem;
}

.quick-note-section {
  margin-top: auto;
}

.textarea-wrapper {
  position: relative;
}

.quick-textarea {
  width: 100%;
  height: 6rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1.25rem;
  padding: 1rem;
  color: var(--text-primary);
  font-size: 0.8125rem;
  resize: none;
  outline: none;
  transition: all 0.2s;
}

.quick-textarea:focus {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
}

.send-note-btn {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: color 0.2s;
}

.send-note-btn:hover {
  color: var(--accent-primary);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

@media (max-width: 1280px) {
  .right-aside {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-stats-row {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .divider-v {
    display: none;
  }

  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.pb-32 {
  padding-bottom: 8rem;
}
</style>
