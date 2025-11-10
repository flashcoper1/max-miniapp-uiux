
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
    id: string;
    name: string;
    avatarUrl?: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    dueDate?: Date;
    priority: TaskPriority;
    assignee?: User;
    subtaskCount?: number;
}