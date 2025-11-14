import type { Task } from '../types';

const TASKS_KEY = 'zenith_tasks';

export const taskApi = {
  getTasks: (): Task[] => {
    const tasks = localStorage.getItem(TASKS_KEY);
    return tasks ? JSON.parse(tasks) : [];
  },

  addTask: (task: Omit<Task, 'id' | 'createdAt'>): Task => {
    const tasks = taskApi.getTasks();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return newTask;
  },

  updateTask: (id: string, updates: Partial<Task>): Task | null => {
    const tasks = taskApi.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    tasks[index] = { ...tasks[index], ...updates };
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return tasks[index];
  },

  deleteTask: (id: string): boolean => {
    const tasks = taskApi.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    if (filtered.length === tasks.length) return false;

    localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
    return true;
  },

  toggleTaskStatus: (id: string): Task | null => {
    const task = taskApi.getTasks().find(t => t.id === id);
    if (!task) return null;

    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    return taskApi.updateTask(id, { status: newStatus });
  }
};

