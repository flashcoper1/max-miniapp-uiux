import React, { useState, useEffect } from 'react';
import { taskApi } from '../../api/taskApi';
import type { Task } from '../../types';
import Statistics from '../../components/organisms/Statistics';
import './StatisticsScreen.css';

const StatisticsScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const loadedTasks = taskApi.getTasks();
    setTasks(loadedTasks);
  };

  return (
    <div className="statistics-screen">
      <header className="statistics-screen-header">
        <h1 className="statistics-screen-title">Аналитика</h1>
        <p className="statistics-screen-subtitle">Отслеживайте свой прогресс</p>
      </header>

      <Statistics tasks={tasks} />

      <div className="insights-section">
        <h2 className="insights-title">Инсайты</h2>

        <div className="insight-card">
          <div className="insight-icon">💡</div>
          <div className="insight-content">
            <h3>Совет дня</h3>
            <p>Планируйте важные задачи на утро, когда ваша продуктивность максимальна</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">🎯</div>
          <div className="insight-content">
            <h3>Ваша цель</h3>
            <p>Стремитесь завершать хотя бы 3 задачи в день для поддержания стабильного прогресса</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsScreen;

