import { useState } from 'react';
import type { Task } from './types';
import { taskApi } from './api/taskApi';
import { MaxUI, Button } from '@maxhub/max-ui';
import TaskListScreen from './screens/TaskListScreen';
import CalendarScreen from './screens/CalendarScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import TaskFormOrganism from './components/organisms/TaskFormOrganism';
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
            <TaskListScreen onOpenCalendar={() => setCurrentScreen('calendar')} />
          )}
          {currentScreen === 'calendar' && (
            <CalendarScreen />
          )}
          {currentScreen === 'stats' && (
            <StatisticsScreen />
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          {/* FAB positioned inside bottom-nav for consistent placement */}
          <Button
            className="fab"
            mode="primary"
            aria-label="Добавить задачу"
            onClick={() => setIsFormOpen(true)}
          >
            <svg className="fab-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 5v14" stroke="white" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 12h14" stroke="white" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
          <div style={{display: 'flex', gap: 12}}>
            <button
              className={`nav-item ${currentScreen === 'tasks' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('tasks')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
              <span>Задачи</span>
            </button>
          </div>

          <div style={{display: 'flex', gap: 12}}>
            <button
              className={`nav-item ${currentScreen === 'stats' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('stats')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20V10M18 20V4M6 20v-4" />
              </svg>
              <span>Статистика</span>
            </button>
          </div>
        </nav>

        {/* Task Form Modal */}
        <TaskFormOrganism
          isOpen={isFormOpen}
          onSubmit={handleCreateTask}
          onClose={() => setIsFormOpen(false)}
        />
      </div>
    </MaxUI>
  );
}

export default App;

