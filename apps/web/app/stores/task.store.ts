import { defineStore } from 'pinia';
import type { Task, TaskStatus } from '../types/task.types';

export const useTaskStore = defineStore('tasks', {
    state: () => ({
        tasks: [] as Task[],
        activeTaskId: null as string | null,
    }),

    actions: {
        addTask(task: Omit<Task, 'id' | 'createdAt' | 'status'>) {
            const newTask: Task = {
                ...task,
                id: Date.now().toString(),
                createdAt: Date.now(),
                scheduledAt: task.scheduledAt || Date.now() + 3600000,
                status: 'pending',
            };
            this.tasks.push(newTask);
            return newTask;
        },

        updateTask(id: string, updates: Partial<Task>) {
            const index = this.tasks.findIndex(t => t.id === id);
            if (index !== -1) {
                this.tasks[index] = { ...this.tasks[index], ...updates } as Task;
            }
        },

        deleteTask(id: string) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            if (this.activeTaskId === id) this.activeTaskId = null;
        },

        startTask(id: string) {
            // If there's another active task, stop it first
            if (this.activeTaskId && this.activeTaskId !== id) {
                this.stopTask(this.activeTaskId);
            }

            this.activeTaskId = id;
            this.updateTask(id, {
                status: 'in-progress',
                startedAt: Date.now()
            });
        },

        stopTask(id: string) {
            if (this.activeTaskId === id) {
                this.activeTaskId = null;
            }
            const task = this.tasks.find(t => t.id === id);
            if (task && task.status === 'in-progress') {
                this.updateTask(id, { status: 'pending' });
            }
        },

        completeTask(id: string) {
            if (this.activeTaskId === id) {
                this.activeTaskId = null;
            }
            this.updateTask(id, {
                status: 'completed',
                completedAt: Date.now()
            });
        },

        cancelTask(id: string) {
            if (this.activeTaskId === id) {
                this.activeTaskId = null;
            }
            this.updateTask(id, {
                status: 'cancelled'
            });
        },

        initializeExampleData() {
            if (this.tasks.length > 0) return;

            const now = new Date();
            const getTs = (days: number, hours: number) => {
                const d = new Date(now);
                d.setDate(d.getDate() + days);
                d.setHours(hours, 0, 0, 0);
                return d.getTime();
            };

            this.tasks = [
                {
                    id: '1',
                    title: 'Revisión de diseño UI Raya App',
                    project: 'Branding 2024',
                    category: 'Diseño',
                    scheduledAt: getTs(0, 10),
                    priority: 2,
                    tagColor: 'red',
                    duration: '45 min',
                    status: 'pending',
                    createdAt: Date.now()
                },
                {
                    id: '2',
                    title: 'Preparar reporte de métricas Q3',
                    project: 'Operaciones',
                    category: 'Gestión',
                    scheduledAt: getTs(0, 15),
                    priority: 3,
                    tagColor: 'amber',
                    duration: '2h',
                    status: 'pending',
                    createdAt: Date.now()
                },
                {
                    id: '3',
                    title: 'Feedback sesión con equipo creativo',
                    project: null,
                    category: 'Reunión',
                    scheduledAt: getTs(1, 11),
                    priority: 1,
                    tagColor: 'emerald',
                    duration: '30 min',
                    status: 'pending',
                    createdAt: Date.now()
                },
                {
                    id: '4',
                    title: 'Planificación estratégica de contenidos v2',
                    project: null,
                    category: 'Estrategia',
                    scheduledAt: getTs(3, 9),
                    priority: 2,
                    tagColor: 'emerald',
                    duration: '1.5h',
                    status: 'pending',
                    createdAt: Date.now()
                }
            ];
        }
    },

    getters: {
        groupedTasks: (state) => {
            const groups: Record<string, Task[]> = {
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

            state.tasks.forEach(task => {
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
        },

        allProjects: (state) => {
            const projects = state.tasks
                .map(t => t.project)
                .filter((p): p is string => !!p);
            return [...new Set(projects)];
        },

        allCategories: (state) => {
            const categories = state.tasks
                .map(t => t.category)
                .filter((c): c is string => !!c);
            return [...new Set(categories)];
        },

        allTags: (state) => {
            const tags = state.tasks.map(t => t.tagColor);
            return [...new Set(tags)];
        }
    }
});
