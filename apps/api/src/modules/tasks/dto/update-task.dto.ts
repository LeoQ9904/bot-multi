export class UpdateTaskDto {
    title?: string;
    project?: string;
    description?: string;
    category?: string;
    status?: string;
    priority?: number;
    duration?: string;
    tagColor?: string;
    scheduledAt?: number;
    startedAt?: number;
    completedAt?: number;
}
