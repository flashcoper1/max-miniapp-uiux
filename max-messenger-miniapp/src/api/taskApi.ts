// src/api/taskApi.ts
import { type Task } from '../types';

// Эмуляция API с возможностью ошибки для демонстрации отказоустойчивости.
const mockTasks: Task[] = [
    { id: '1', title: 'Подготовить презентацию для хакатона', description: '', isCompleted: false, priority: 'high', dueDate: new Date() },
    { id: '2', title: 'Написать бэкенд на Java', description: 'Использовать Spring Boot', isCompleted: false, priority: 'high' },
    { id: '3', title: 'Продумать UX сценарии', description: '', isCompleted: true, priority: 'medium', dueDate: new Date() },
    { id: '4', title: 'Интеграция с Яндекс Календарем', description: 'OAuth 2.0', isCompleted: false, priority: 'low' },
];

export const taskApi = {
    fetch: (): Promise<Task[]> => new Promise((resolve, reject) => {
        console.log('API: Запрос на получение задач...');
        setTimeout(() => Math.random() > 0.2 ? resolve([...mockTasks]) : reject(new Error('Ошибка сети при загрузке')), 1500);
    }),

    update: (task: Partial<Task> & Pick<Task, 'id'>): Promise<Task> => new Promise((resolve, reject) => {
        console.log('API: Обновление задачи...', task.id);
        setTimeout(() => {
            if (Math.random() > 0.3) {
                const existingTask = mockTasks.find(t => t.id === task.id)!;
                Object.assign(existingTask, task);
                resolve(existingTask);
            } else {
                reject(new Error(`Не удалось обновить задачу`));
            }
        }, 800);
    }),

    create: (values: {title: string, description: string}): Promise<Task> => new Promise((resolve) => {
        console.log('API: Создание задачи...', values);
        setTimeout(() => {
            const newTask: Task = {
                id: Date.now().toString(),
                ...values,
                isCompleted: false,
                priority: 'medium',
            };
            mockTasks.unshift(newTask);
            resolve(newTask);
        }, 1000);
    })
};