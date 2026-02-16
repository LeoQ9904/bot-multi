import { defineStore } from 'pinia';
import type { Task } from '../types/task.types';
import { useTaskService } from '../services/task.service';
import { useFirebaseAuth } from '~/composables/useAuth';
import { format, parse, parseISO } from 'date-fns';

export const DEFAULT_TAG_COLORS = ['blue', 'purple', 'emerald', 'amber', 'red'];

export const useTaskStore = defineStore('tasks', {
    state: () => ({
        tasks: [] as Task[],
        activeTaskId: null as string | null,
    }),

    actions: {
        async fetchTasks() {
            const { user } = useFirebaseAuth();
            if (!user.value) return;
            try {
                const token = await user.value.getIdToken();
                const res = await useTaskService().findAll(token);
                if (res && res.data) {
                    this.tasks = res.data;
                }
            } catch (e) {
                console.error('Failed to fetch tasks', e);
            }
        },

        async addTask(task: Omit<Task, 'id' | 'createdAt' | 'status'>) {
            const { user } = useFirebaseAuth();
            if (!user.value) return;
            try {
                const token = await user.value.getIdToken();
                const res = await useTaskService().create(task as any, token);
                if (res && res.data) {
                    this.tasks.push(res.data);
                    return res.data;
                }
            } catch (e) {
                console.error('Failed to add task', e);
            }
        },

        async updateTask(id: string, updates: Partial<Task>) {
            const { user } = useFirebaseAuth();
            if (!user.value) return;
            try {
                const token = await user.value.getIdToken();
                const res = await useTaskService().update(id, updates, token);
                if (res && res.data) {
                    const index = this.tasks.findIndex(t => t.id === id);
                    if (index !== -1) {
                        this.tasks[index] = res.data;
                    }
                }
            } catch (e) {
                console.error('Failed to update task', e);
            }
        },

        async deleteTask(id: string) {
            const { user } = useFirebaseAuth();
            if (!user.value) return;
            try {
                const token = await user.value.getIdToken();
                await useTaskService().delete(id, token);
                this.tasks = this.tasks.filter(t => t.id !== id);
                if (this.activeTaskId === id) this.activeTaskId = null;
            } catch (e) {
                console.error('Failed to delete task', e);
            }
        },

        async startTask(id: string) {
            if (this.activeTaskId && this.activeTaskId !== id) {
                await this.stopTask(this.activeTaskId);
            }
            this.activeTaskId = id;
            await this.updateTask(id, {
                status: 'in-progress',
                startedAt: Date.now().toString()
            });
        },

        async stopTask(id: string) {
            if (this.activeTaskId === id) {
                this.activeTaskId = null;
            }
            const task = this.tasks.find(t => t.id === id);
            if (task && task.status === 'in-progress') {
                await this.updateTask(id, { status: 'pending' });
            }
        },

        async completeTask(id: string) {
            if (this.activeTaskId === id) {
                this.activeTaskId = null;
            }
            await this.updateTask(id, {
                status: 'completed',
                completedAt: new Date().toISOString()
            });
        },

        async cancelTask(id: string) {
            if (this.activeTaskId === id) {
                this.activeTaskId = null;
            }
            await this.updateTask(id, {
                status: 'cancelled'
            });
        },

        initializeExampleData() {
            // No longer used, handled by fetchTasks if data exists in DB
        }
    },

    getters: {
        allTagColors: (state) => {
            const customColors = new Set<string>();
            state.tasks.forEach(task => {
                const color = task.tagColor;
                if (!DEFAULT_TAG_COLORS.includes(color) && color.startsWith('#')) {
                    customColors.add(color);
                }
            });
            return [...DEFAULT_TAG_COLORS, ...Array.from(customColors)];
        },
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
