import React, { useState } from 'react';
import type { Task } from './types';
import { taskApi } from './api/taskApi';
import { MaxUI, Button } from '@maxhub/max-ui';
import TaskListScreen from './screens/TaskListScreen';
import CalendarScreen from './screens/CalendarScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import TaskFormOrganism from './organisms/TaskFormOrganism';
import './App.css';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'tasks' | 'calendar' | 'stats'>('tasks');

  const handleCreateTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    taskApi.addTask(task);
    setIsFormOpen(false);
  };

  return (
    <MaxUI>
      <div className="app">
        <div className="app-container">
          {currentScreen === 'tasks' && (
            <TaskListScreen onCreateTask={() => setIsFormOpen(true)} />
          )}
          {currentScreen === 'calendar' && (
            <CalendarScreen />
          )}
          {currentScreen === 'stats' && (
            <StatisticsScreen />
          )}
        </div>

        {/* FAB */}
        <Button
          className="fab"
          mode="primary"
          onClick={() => setIsFormOpen(true)}
        >
          +
        </Button>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <button
            className={`nav-item ${currentScreen === 'tasks' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('tasks')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <span>Задачи</span>
          </button>

          <button
            className={`nav-item ${currentScreen === 'calendar' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('calendar')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Календарь</span>
          </button>

          <button
            className={`nav-item ${currentScreen === 'stats' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('stats')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20V10M18 20V4M6 20v-4" />
            </svg>
            <span>Статистика</span>
          </button>
        </nav>

        {/* Task Form Modal */}
        {isFormOpen && (
          <TaskFormOrganism
            onSubmit={handleCreateTask}
            onClose={() => setIsFormOpen(false)}
          />
        )}
      </div>
    </MaxUI>
  );
}

export default App;

