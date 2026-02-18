import { useTaskStore } from '~/stores/task.store';
import { useRoute } from 'vue-router';
import type { Task } from '~/types/task.types';

export const useTaskActions = () => {
    const taskStore = useTaskStore();
    const route = useRoute();

    // Navigation Actions
    const openNewTask = async () => {
        await navigateTo({
            path: '/task',
            query: { ...route.query, new: '' }
        });
    };

    const openEditTask = async (taskId: string | number) => {
        await navigateTo({
            path: '/task',
            query: { ...route.query, edit: String(taskId), view: undefined }
        });
    };

    const openViewTask = async (taskId: string | number) => {
        await navigateTo({
            path: '/task',
            query: { ...route.query, view: String(taskId), edit: undefined }
        });
    };

    // Store Actions
    const handleStart = async (taskId: string | number) => {
        await taskStore.startTask(String(taskId));
    };

    const handleStop = async (taskId: string | number) => {
        await taskStore.stopTask(String(taskId));
    };

    const handleComplete = async (taskId: string | number) => {
        await taskStore.completeTask(String(taskId));
    };

    const handleCancel = async (taskId: string | number) => {
        await taskStore.cancelTask(String(taskId));
    };

    const handleClose = async () => {
        await navigateTo({
            path: '/task',
            query: { ...route.query, new: undefined, edit: undefined, view: undefined }
        });
    };

    const handleDelete = async (taskId: string | number) => {
        if (confirm('¿Deseas eliminar esta tarea?')) {
            await taskStore.deleteTask(String(taskId));
            return true;
        }
        return false;
    };

    const handleSaveTask = async (formData: any, editingTask?: Task | null) => {
        if (editingTask) {
            await taskStore.updateTask(editingTask.id, formData);
        } else {
            await taskStore.addTask(formData);
        }
    };

    return {
        openNewTask,
        openEditTask,
        openViewTask,
        handleStart,
        handleStop,
        handleComplete,
        handleCancel,
        handleClose,
        handleDelete,
        handleSaveTask
    };
};
