import React, { useState, useMemo } from 'react';
import { Panel, Flex, IconButton, Button } from '@maxhub/max-ui';
import type { Task } from '../../../types';
import './Calendar.css';

interface CalendarProps {
  tasks: Task[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Adjust for Monday start

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month's days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const hasTasksOnDate = (date: Date) => {
    return tasks.some(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handlePrevMonth = () => {
    setTransitionDirection('left');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const handleNextMonth = () => {
    setTransitionDirection('right');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const handleDayClick = (date: Date) => {
    onDateSelect(date);
  };

  return (
    <Panel className="calendar-panel">
      {/* Header */}
      <Flex className="calendar-header" justify="space-between" align="center">
        <IconButton
          mode="tertiary"
          className="calendar-nav-btn"
          onClick={handlePrevMonth}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </IconButton>

        <div className="calendar-title">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>

        <IconButton
          mode="tertiary"
          className="calendar-nav-btn"
          onClick={handleNextMonth}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </IconButton>
      </Flex>

      {/* Day names */}
      <div className="calendar-weekdays">
        {dayNames.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className={`calendar-grid ${isTransitioning ? 'transitioning' : ''} ${transitionDirection}`}>
        {days.map((day, index) => (
          <Button
            key={index}
            mode="tertiary"
            className="calendar-day"
            data-today={isToday(day.date)}
            data-selected={isSelected(day.date)}
            data-disabled={!day.isCurrentMonth}
            onClick={() => day.isCurrentMonth && handleDayClick(day.date)}
          >
            <span className="calendar-day-number">{day.date.getDate()}</span>
            {hasTasksOnDate(day.date) && day.isCurrentMonth && (
              <span className="calendar-day-dot" />
            )}
          </Button>
        ))}
      </div>
    </Panel>
  );
};

export default Calendar;

