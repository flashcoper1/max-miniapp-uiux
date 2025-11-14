import React, { useState, useEffect } from 'react';
import type { Task, TaskFilter, TaskStats } from '../../types';
import { taskApi } from '../../api/taskApi';
import { Button } from '@maxhub/max-ui';
import TaskItem from '../../components/molecules/TaskItem';
import './TaskListScreen.css';

const TaskListScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [userName] = useState('Виктор'); // В реальном приложении из контекста

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
    // TODO: Открыть детали задачи
    console.log('Task clicked:', task);
  };

  const getStats = (): TaskStats => {
    return {
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };
  };

  const getFilteredTasks = (): Task[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today':
        return tasks.filter(t => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          return dueDate >= today && dueDate < new Date(today.getTime() + 86400000);
        });
      case 'expiring':
        return tasks.filter(t => {
          if (!t.dueDate || t.status === 'completed') return false;
          const dueDate = new Date(t.dueDate);
          return dueDate < new Date(now.getTime() + 7 * 86400000); // Next 7 days
        }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
      default:
        return tasks;
    }
  };

  const stats = getStats();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="task-list-screen">
      {/* Header */}
      <header className="screen-header">
        <h1 className="greeting">Привет, {userName} 👋</h1>
        <p className="subtitle">У вас {stats.todo} задач к выполнению</p>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.todo}</h3>
            <p className="stat-label">К выполнению</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.inProgress}</h3>
            <p className="stat-label">В работе</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.completed}</h3>
            <p className="stat-label">Выполнено</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <Button
          mode={filter === 'all' ? 'primary' : 'secondary'}
          size="s"
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все
        </Button>
        <Button
          mode={filter === 'today' ? 'primary' : 'secondary'}
          size="s"
          className={`filter-chip ${filter === 'today' ? 'active' : ''}`}
          onClick={() => setFilter('today')}
        >
          Сегодня
        </Button>
        <Button
          mode={filter === 'expiring' ? 'primary' : 'secondary'}
          size="s"
          className={`filter-chip ${filter === 'expiring' ? 'active' : ''}`}
          onClick={() => setFilter('expiring')}
        >
          Истекающие
        </Button>
      </div>

      {/* Task List */}
      <div className="tasks-section">
        <h2 className="section-title">Мои задачи</h2>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>Нет задач</h3>
            <p>Создайте новую задачу, нажав кнопку "+"</p>
          </div>
        ) : (
          <div className="task-list">
            {filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onClick={handleTaskClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListScreen;

