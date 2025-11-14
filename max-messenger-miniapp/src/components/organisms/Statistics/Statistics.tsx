import React, { useState, useEffect } from 'react';
import { Panel, Button } from '@maxhub/max-ui';
import type { Task } from '../../../types';
import './Statistics.css';

interface StatisticsProps {
  tasks: Task[];
}

type Period = 'week' | 'month' | 'year';

const Statistics: React.FC<StatisticsProps> = ({ tasks }) => {
  const [period, setPeriod] = useState<Period>('week');
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const getFilteredTasks = () => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return tasks.filter(task => {
      const createdDate = new Date(task.createdAt);
      return createdDate >= startDate;
    });
  };

  const filteredTasks = getFilteredTasks();
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  const completionPercentage = filteredTasks.length > 0
    ? Math.round((completedTasks.length / filteredTasks.length) * 100)
    : 0;

  const getMostProductiveDay = () => {
    const dayCount: { [key: string]: number } = {};

    completedTasks.forEach(task => {
      const date = new Date(task.createdAt);
      const dayName = date.toLocaleDateString('ru-RU', { weekday: 'long' });
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    });

    const entries = Object.entries(dayCount);
    if (entries.length === 0) return 'Нет данных';

    const [day, count] = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    return `${day.charAt(0).toUpperCase() + day.slice(1)} (${count})`;
  };

  // Animate percentage on load and period change
  useEffect(() => {
    const animationDuration = isInitialLoad ? 600 : 300;
    const steps = 40;
    const increment = completionPercentage / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= completionPercentage) {
        setAnimatedPercentage(completionPercentage);
        clearInterval(timer);
        if (isInitialLoad) setIsInitialLoad(false);
      } else {
        setAnimatedPercentage(Math.floor(current));
      }
    }, animationDuration / steps);

    return () => clearInterval(timer);
  }, [completionPercentage, isInitialLoad]);

  const circumference = 2 * Math.PI * 70; // radius = 70
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <Panel className="statistics-panel">
      {/* Header */}
      <div className="statistics-header">
        <h2 className="statistics-title">Статистика</h2>

        <div className="segmented-control">
          <Button
            mode="tertiary"
            className={`segmented-btn ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            Неделя
          </Button>
          <Button
            mode="tertiary"
            className={`segmented-btn ${period === 'month' ? 'active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            Месяц
          </Button>
          <Button
            mode="tertiary"
            className={`segmented-btn ${period === 'year' ? 'active' : ''}`}
            onClick={() => setPeriod('year')}
          >
            Год
          </Button>
        </div>
      </div>

      {/* Progress Circle - Donut Chart */}
      <div className="progress-circle-container">
        <svg className="progress-circle" viewBox="0 0 160 160">
          <defs>
            {/* Main gradient for progress */}
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9484e3" />
              <stop offset="100%" stopColor="#7E6FD5" />
            </linearGradient>

            {/* Subtle glow effect */}
            <filter id="glowEffect">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background circle (track) */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="#4a4a52"
            strokeWidth="14"
            opacity="0.3"
            className="progress-track"
          />

          {/* Progress circle with animation */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 80 80)"
            className="progress-circle-stroke"
            filter="url(#glowEffect)"
          />
        </svg>

        {/* Center percentage text */}
        <div className="progress-percentage">
          <span className="percentage-number">{animatedPercentage}</span>
          <span className="percent-sign">%</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-list">
        <div className="metric-item">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Задач выполнено</span>
          </div>
          <div className="metric-value">{completedTasks.length}</div>
        </div>

        <div className="metric-item">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Самый продуктивный день</span>
          </div>
          <div className="metric-value metric-value-text">{getMostProductiveDay()}</div>
        </div>

        <div className="metric-item">
          <div className="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Всего задач</span>
          </div>
          <div className="metric-value">{filteredTasks.length}</div>
        </div>
      </div>
    </Panel>
  );
};

export default Statistics;

