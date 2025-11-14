import React, { useState, useEffect } from 'react';
import { Flex, Button } from '@maxhub/max-ui';
import { taskApi } from '../../api/taskApi';
import type { Task } from '../../types';
import TaskItem from '../../components/molecules/TaskItem';
import './TaskListScreen.css';

type FilterType = 'all' | 'today' | 'overdue';

interface Filter {
  id: FilterType;
  label: string;
}

const filters: Filter[] = [
  { id: 'all', label: 'Все' },
  { id: 'today', label: 'Сегодня' },
  { id: 'overdue', label: 'Истекающие' },
];

const TaskListScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const loadedTasks = taskApi.getTasks();
    setTasks(loadedTasks);
  };

  const handleToggleTask = (id: string) => {
    taskApi.toggleTaskStatus(id);
    loadTasks();
  };

  const handleDeleteTask = (id: string) => {
    taskApi.deleteTask(id);
    loadTasks();
  };

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
  };

  const getFilteredTasks = (): Task[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (activeFilter) {
      case 'today':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate.toDateString() === today.toDateString();
        });
      case 'overdue':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate < now && task.status !== 'completed';
        });
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  const getStatusCounts = () => {
    return {
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="task-list-screen">
      {/* Header */}
      <header className="screen-header">
        <h1 className="screen-title">Виктор Иванов</h1>
        <p className="screen-subtitle">Давайте сделаем этот день продуктивным</p>
      </header>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card stat-card-primary">
          <div className="stat-value">{counts.todo}</div>
          <div className="stat-label">К выполнению</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{counts.inProgress}</div>
          <div className="stat-label">В работе</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{counts.completed}</div>
          <div className="stat-label">Выполнено</div>
        </div>
      </div>

      {/* Filters */}
      <Flex gap={8} className="filters">
        {filters.map(filter => (
          <Button
            key={filter.id}
            mode={activeFilter === filter.id ? 'primary' : 'secondary'}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </Flex>

      {/* Task List */}
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-text">Задач не найдено</p>
            <p className="empty-state-hint">Создайте новую задачу, нажав на кнопку +</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onClick={handleTaskClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskListScreen;

