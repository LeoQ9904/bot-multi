<template>
    <div class="aside-content-wrapper">
        <div class="plan-carousel">
            <div class="carousel-header">
                <button class="nav-btn" @click="changeDate(-1)">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <div class="date-info">
                    <span class="date-label">{{ formattedDate }}</span>
                    <span class="date-relative">{{ relativeDate }}</span>
                </div>
                <button class="nav-btn" @click="changeDate(1)">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>

            <div class="insight-card-wrapper" :class="{ 'loading': isLoading }">
                <div class="insight-card" v-if="planText && !planMessage">
                    <div class="insight-header">
                        <div class="header-main">
                            <span class="material-symbols-outlined">analytics</span>
                            <span class="insight-label">Plan de Trabajo</span>
                        </div>
                        <button class="regenerate-icon-btn" @click="generatePlan" :disabled="isGenerating"
                            title="Regenerar plan">
                            <span class="material-symbols-outlined" :class="{ 'spinning': isGenerating }">refresh</span>
                        </button>
                    </div>
                    <div class="insight-text">{{ planText }}</div>
                </div>

                <div class="empty-plan" v-else-if="!isLoading">
                    <span class="material-symbols-outlined empty-icon">lightbulb</span>
                    <p class="empty-text">{{ planMessage || 'No hay plan para esta fecha.' }}</p>
                    <button class="generate-btn" @click="generatePlan"
                        :disabled="isGenerating || tasksOnSelectedDay.length === 0">
                        <template v-if="!isGenerating">
                            <span class="material-symbols-outlined">magic_button</span>
                            Generar Plan
                        </template>
                        <template v-else>
                            <span class="loader"></span>
                            Generando...
                        </template>
                    </button>
                </div>

                <div class="loading-state" v-else>
                    <span class="loader"></span>
                    <p>Cargando plan...</p>
                </div>
            </div>
        </div>

        <div class="metrics-section">
            <h3 class="aside-section-title">Métricas del Día</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <span class="metric-value">{{ hoursOnSelectedDay }} </span>
                    <span class="metric-label">Trabajo Estimado</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value">{{ tasksCompletedOnSelectedDay }}</span>
                    <span class="metric-label">Tareas Completadas</span>
                </div>
            </div>
        </div>

        <div class="events-section">
            <h3 class="aside-section-title">Eventos del Día</h3>
            <div class="events-list custom-scrollbar">
                <div v-for="event in pendingTasksOnSelectedDay" :key="event.id" class="event-item">
                    <div class="event-indicator" :style="{ background: event.tagColor }"></div>
                    <div class="event-info">
                        <p class="event-name">{{ event.title }}</p>
                        <p class="event-time">{{ formatStartAt(event.scheduledAt, event.duration) }}</p>
                    </div>
                </div>
                <div v-if="pendingTasksOnSelectedDay.length === 0" class="no-events">
                    No hay eventos programados
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { format, addDays, isToday, isYesterday, isTomorrow, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTaskService } from '~/services/task.service';
import { useFirebaseAuth } from '~/composables/useAuth';
import { useTaskStore } from '~/stores/task.store';

const { user } = useFirebaseAuth();
const taskService = useTaskService();
const taskStore = useTaskStore();

const selectedDate = ref(new Date());
const planText = ref<string | null>(null);
const planMessage = ref<string | null>(null);
const isLoading = ref(false);
const isGenerating = ref(false);

const formattedDate = computed(() => {
    return format(selectedDate.value, 'EEEE, d MMM', { locale: es });
});

const relativeDate = computed(() => {
    if (isToday(selectedDate.value)) return 'Hoy';
    if (isYesterday(selectedDate.value)) return 'Ayer';
    if (isTomorrow(selectedDate.value)) return 'Mañana';
    return '';
});

const tasksOnSelectedDay = computed(() => {
    return taskStore.tasks.filter(task => isSameDay(new Date(task.scheduledAt), selectedDate.value));
});

const hoursOnSelectedDay = computed(() => {
    const totalMinutes = tasksOnSelectedDay.value.reduce((acc, task) => {
        const duration = task.duration || '0 min';
        const minutes = parseInt(duration.split(' ')[0]) || 0;
        return acc + minutes;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}.${mins.toString().padStart(2, '0')} h`;
});

const tasksCompletedOnSelectedDay = computed(() => {
    const completed = tasksOnSelectedDay.value.filter(task => task.status === 'completed');
    return `${completed.length}/${tasksOnSelectedDay.value.length}`;
});

const pendingTasksOnSelectedDay = computed(() => {
    return tasksOnSelectedDay.value.filter(task => task.status !== 'completed' && task.status !== 'cancelled');
});

const changeDate = (days: number) => {
    selectedDate.value = addDays(selectedDate.value, days);
};

const fetchPlan = async () => {
    if (!user.value) return;
    isLoading.value = true;
    planText.value = null;
    planMessage.value = null;
    const dateStr = format(selectedDate.value, 'yyyy-MM-dd');
    try {
        const token = await user.value.getIdToken();
        const response: any = await taskService.getPlan(dateStr, token);

        if (response.data?.message) {
            planMessage.value = response.data.message;
        } else if (response.data) {
            planText.value = typeof response.data === 'string' ? response.data : (response.data.raw || null);
        }
    } catch (error) {
        console.error('Error fetching plan:', error);
    } finally {
        isLoading.value = false;
    }
};

// watch task availability to clear planMessage if tasks are added
watch(() => tasksOnSelectedDay.value.length, (newCount) => {
    if (newCount > 0 && planMessage.value?.includes('tareas programadas')) {
        planMessage.value = null;
    }
});

watch(selectedDate, fetchPlan);

const generatePlan = async () => {
    if (!user.value) return;
    isGenerating.value = true;
    const dateStr = format(selectedDate.value, 'yyyy-MM-dd');
    try {
        const token = await user.value.getIdToken();
        const response: any = await taskService.generatePlan(dateStr, token);

        if (response.data?.message) {
            planMessage.value = response.data.message;
            planText.value = null;
        } else if (response.data) {
            planText.value = typeof response.data === 'string' ? response.data : (response.data.raw || null);
            planMessage.value = null;
        }
    } catch (error) {
        console.error('Error generating plan:', error);
    } finally {
        isGenerating.value = false;
    }
};

watch(selectedDate, fetchPlan);

onMounted(fetchPlan);

const formatStartAt = (ts: any, duration: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
};
</script>

<style scoped>
.aside-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.plan-carousel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.carousel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    border-radius: 1rem;
    padding: 0.5rem;
}

.nav-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
}

.nav-btn:hover {
    background: var(--glass-bg);
    color: var(--text-primary);
}

.date-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.date-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-primary);
    text-transform: capitalize;
}

.date-relative {
    font-size: 0.625rem;
    color: var(--accent-primary);
    font-weight: 800;
    text-transform: uppercase;
}

.insight-card-wrapper {
    min-height: 120px;
    display: flex;
}

.insight-card {
    padding: 1rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 1rem;
    width: 100%;
}

.insight-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    color: var(--accent-primary);
    margin-bottom: 0.75rem;
}

.header-main {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.regenerate-icon-btn {
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
}

.regenerate-icon-btn:hover:not(:disabled) {
    background: var(--glass-bg);
    color: var(--accent-primary);
}

.regenerate-icon-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.spinning {
    animation: rotation 1s linear infinite;
}

.insight-label {
    font-size: 0.625rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.insight-text {
    font-size: 0.75rem;
    line-height: 1.6;
    color: var(--text-secondary);
    white-space: pre-line;
}

.empty-plan {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: var(--bg-secondary);
    border: 1px dashed var(--glass-border);
    border-radius: 1rem;
    text-align: center;
    gap: 0.5rem;
}

.empty-icon {
    font-size: 2rem;
    color: var(--text-tertiary);
}

.empty-text {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin: 0;
}

.generate-btn {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--accent-primary);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}

.generate-btn:hover:not(:disabled) {
    background: #4f46e5;
    transform: translateY(-1px);
}

.generate-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.loading-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--text-tertiary);
}

.loader {
    width: 20px;
    height: 20px;
    border: 2px solid var(--glass-border);
    border-bottom-color: var(--accent-primary);
    border-radius: 50%;
    display: inline-block;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.aside-section-title {
    font-size: 0.6875rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.2rem;
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
}

.events-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 40vh;
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

.no-events {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    text-align: center;
    padding: 1rem;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--glass-border);
    border-radius: 10px;
}
</style>
