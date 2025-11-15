import React, { useState, useEffect } from 'react';
import { Flex } from '@maxhub/max-ui';
import { taskApi } from '../../api/taskApi';
import type { Task } from '../../types';
import TaskItem from '../../components/molecules/TaskItem';
import './TaskListScreen.css';

type FilterType = 'all' | 'today' | 'overdue' | 'recent';

interface Filter {
  id: FilterType;
  label: string;
}

const filters: Filter[] = [
  { id: 'all', label: 'Все' },
  { id: 'overdue', label: 'Истекающие' },
  { id: 'recent', label: 'Недавние' },
  { id: 'today', label: 'Сегодня' },
];

interface TaskListScreenProps {
  onOpenCalendar?: () => void;
}

const TaskListScreen: React.FC<TaskListScreenProps> = ({ onOpenCalendar }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    // Seed demo tasks if none exist so the screen can be demonstrated
    const existing = taskApi.getTasks();
    if (!existing || existing.length === 0) {
      seedDemoTasks();
    }
    loadTasks();
  }, []);

  const loadTasks = () => {
    const loadedTasks = taskApi.getTasks();
    setTasks(loadedTasks);
  };

  const seedDemoTasks = () => {
    // Create demo tasks to reflect the design mock
    const demo: Omit<Task, 'id' | 'createdAt'>[] = [];

    for (let i = 0; i < 12; i++) {
      demo.push({
        title: `Встреча с клиентом ${i + 1}`,
        description: '',
        dueDate: new Date(2025, 10, 1).toISOString(),
        priority: 'medium',
        status: 'todo',
      });
    }

    for (let i = 0; i < 7; i++) {
      demo.push({
        title: `Работа над задачей ${i + 1}`,
        description: '',
        dueDate: new Date(2025, 10, 2).toISOString(),
        priority: 'low',
        status: 'in-progress',
      });
    }

    for (let i = 0; i < 3; i++) {
      demo.push({
        title: `Архивная задача ${i + 1}`,
        description: '',
        dueDate: new Date(2025, 9, 20).toISOString(),
        priority: 'low',
        status: 'completed',
      });
    }

    demo.forEach(d => taskApi.addTask(d));
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
        <p className="greeting-small">Привет,</p>
        <h1 className="screen-title">Виктор Иванов</h1>
      </header>

      <p className="month-label">В этом месяце</p>

      {/* Stats Cards (2x2 grid) */}
      <div className="stats-cards">
        <div className="stat-card stat-card-primary">
          <div className="stat-value">{counts.todo} Задач</div>
          <div className="stat-label">К выполнению</div>
        </div>

        <div className="stat-card stat-card-muted">
          <div className="stat-value-small">{counts.completed}</div>
          <div className="stat-label">Выполнено</div>
        </div>

        <div className="stat-card stat-card-muted">
          <div className="stat-value-small">{counts.inProgress}</div>
          <div className="stat-label">В работе</div>
        </div>

        <div className="stat-card stat-card-muted">
          <div className="stat-value-small">2</div>
          <div className="stat-label">Отменено</div>
        </div>
      </div>

      {/* Tasks header + filters */}
      <div className="tasks-header">
        <h2 className="tasks-title">Мои задачи</h2>
        <a className="view-all" onClick={() => onOpenCalendar?.()}>Просмотреть</a>
      </div>

      <div className="filters-row">
        <Flex gap={8} className="filters">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`filter-chip ${activeFilter === filter.id ? 'active' : 'inactive'}`}
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={activeFilter === filter.id}
            >
              {filter.label}
            </button>
          ))}
        </Flex>
      </div>

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

