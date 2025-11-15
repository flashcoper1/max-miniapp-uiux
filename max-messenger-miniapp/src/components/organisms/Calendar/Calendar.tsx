import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Panel, Flex, Button } from '@maxhub/max-ui';
import type { Task } from '../../../types';
import './Calendar.css';

interface CalendarProps {
  tasks: Task[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, onDateSelect, selectedDate }) => {
  // Start of the currently visible week (Monday)
  const startOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7; // Monday = 0
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentMonthVisible, setCurrentMonthVisible] = useState<Date>(() => new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1));

  const monthScrollRef = useRef<HTMLDivElement | null>(null);
  const monthItemHeightRef = useRef<number>(0);
  const [isClosing, setIsClosing] = useState(false);

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

  const getWeekDays = (weekStart: Date) => {
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push({ date: d, isCurrentMonth: true });
    }
    return days;
  };

  const days = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

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
    // move one week back
    setTransitionDirection('left');
    setIsTransitioning(true);
    setTimeout(() => {
      const prev = new Date(currentWeekStart);
      prev.setDate(prev.getDate() - 7);
      setCurrentWeekStart(startOfWeek(prev));
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const handleNextMonth = () => {
    // move one week forward
    setTransitionDirection('right');
    setIsTransitioning(true);
    setTimeout(() => {
      const next = new Date(currentWeekStart);
      next.setDate(next.getDate() + 7);
      setCurrentWeekStart(startOfWeek(next));
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const handleDayClick = (date: Date) => {
    onDateSelect(date);
  };

  // Build a small range of months for vertical scrolling (prev..next)
  const monthsRange = useMemo(() => {
    const center = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1);
    const arr: Date[] = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(center.getFullYear(), center.getMonth() + i, 1);
      arr.push(d);
    }
    return arr;
  }, [currentWeekStart]);

  useEffect(() => {
    // when entering month view, set visible month to the center month and scroll to it
    if (viewMode === 'month' && monthScrollRef.current) {
      setCurrentMonthVisible(new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1));
      // measure item height and scroll to center month
      const el = monthScrollRef.current;
      const item = el.querySelector('.calendar-month') as HTMLElement | null;
      if (item) {
        monthItemHeightRef.current = item.getBoundingClientRect().height;
        const index = monthsRange.findIndex(m => m.getMonth() === currentWeekStart.getMonth() && m.getFullYear() === currentWeekStart.getFullYear());
        if (index >= 0) {
          el.scrollTo({ top: index * monthItemHeightRef.current, behavior: 'instant' as ScrollBehavior });
        }
      }
    }
  }, [viewMode, currentWeekStart, monthsRange]);

  // Handle transitionend to complete closing animation reliably
  useEffect(() => {
    const el = monthScrollRef.current;
    if (!el) return;
    const onTransitionEnd = (e: TransitionEvent) => {
      // only act when closing is in progress and the element finished its opacity/transform transition
      if (isClosing) {
        // finish closing
        setIsClosing(false);
        setViewMode('week');
      }
    };
    el.addEventListener('transitionend', onTransitionEnd);
    return () => el.removeEventListener('transitionend', onTransitionEnd);
  }, [isClosing]);

  // Scroll handler: determine which month is visible and update title
  const onMonthScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!monthItemHeightRef.current) {
      const item = el.querySelector('.calendar-month') as HTMLElement | null;
      if (item) monthItemHeightRef.current = item.getBoundingClientRect().height;
    }
    const h = monthItemHeightRef.current || el.clientHeight;
    const index = Math.round(el.scrollTop / h);
    const m = monthsRange[Math.max(0, Math.min(monthsRange.length - 1, index))];
    if (m) setCurrentMonthVisible(m);
  };

  const toggleViewMode = () => {
    if (viewMode === 'week') {
      setViewMode('month');
    } else {
      // start closing animation; actual switch to week happens on transitionend
      setIsClosing(true);
    }
  };

  const handleMonthDaySelect = (date: Date) => {
    onDateSelect(date);
    setCurrentWeekStart(startOfWeek(date));
    setIsClosing(true);
  };

  return (
    <Panel className="calendar-panel">
      {/* Header */}
      <Flex className="calendar-header" justify="center" align="center">
        <button
          className="calendar-title calendar-title-btn"
          onClick={toggleViewMode}
          aria-pressed={viewMode === 'month' || isClosing}
        >
          {monthNames[(viewMode === 'month' ? currentMonthVisible.getMonth() : currentWeekStart.getMonth())]} {viewMode === 'month' ? currentMonthVisible.getFullYear() : currentWeekStart.getFullYear()}
        </button>
      </Flex>

      {/* Week strip (Mon - Sun) OR Month grid depending on viewMode */}
      {/* show weekstrip only in week mode; hide when month view is open */}
      {viewMode === 'week' && (
        <div className={`calendar-weekstrip ${isTransitioning ? 'transitioning' : ''} ${transitionDirection}`}>
          {days.map((day, index) => (
            <button
              key={index}
              className={`calendar-weekday-item ${isSelected(day.date) ? 'selected' : ''}`}
              data-today={isToday(day.date)}
              onClick={() => handleDayClick(day.date)}
              aria-pressed={isSelected(day.date)}
            >
              <div className="weekday-abbrev">{dayNames[index]}</div>
              <div className="weekday-number">{day.date.getDate()}</div>
              {hasTasksOnDate(day.date) && (
                <span className="calendar-day-dot" />
              )}
            </button>
          ))}
        </div>
      )}

        {(viewMode === 'month' || isClosing) && (
          <div className={`calendar-months ${isClosing ? 'closing' : 'open'}`} ref={monthScrollRef} onScroll={onMonthScroll}>
            {monthsRange.map((month, mi) => (
              <div className="calendar-month" key={mi}>
                <div className={`calendar-grid ${isTransitioning ? 'transitioning' : ''} ${transitionDirection}`}>
                  {getDaysInMonth(month).map((day, index) => (
                    <Button
                      key={index}
                      mode="tertiary"
                      className="calendar-day"
                      data-today={isToday(day.date)}
                      data-selected={isSelected(day.date)}
                      data-disabled={!day.isCurrentMonth}
                      onClick={() => {
                        if (day.isCurrentMonth) {
                          handleMonthDaySelect(day.date);
                        }
                      }}
                    >
                      <span className="calendar-day-number">{day.date.getDate()}</span>
                      {hasTasksOnDate(day.date) && day.isCurrentMonth && (
                        <span className="calendar-day-dot" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
    </Panel>
  );
};

export default Calendar;

