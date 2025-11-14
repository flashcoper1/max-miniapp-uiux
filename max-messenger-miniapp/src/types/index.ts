export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: string;
}

export type TaskFilter = 'all' | 'today' | 'expiring';

export interface TaskStats {
  todo: number;
  inProgress: number;
  completed: number;
}

