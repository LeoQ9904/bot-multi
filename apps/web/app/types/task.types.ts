export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type TaskPriority = 1 | 2 | 3;

export interface Task {
    id: string;
    title: string;
    project?: string | null;
    description?: string;
    category: string;
    status: TaskStatus;
    priority: TaskPriority;
    duration: string;
    tagColor: string;
    scheduledAt: number;
    createdAt: number;
    startedAt?: string | null;
    completedAt?: string | null;
}
