export class CreateTaskDto {
    title: string;
    project?: string;
    description?: string;
    category: string;
    duration?: string;
    tagColor?: string;
    scheduledAt: number;
    priority?: number;
}
