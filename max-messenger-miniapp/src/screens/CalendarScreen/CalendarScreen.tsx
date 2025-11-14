import React, { useState, useEffect } from 'react';
import { taskApi } from '../../api/taskApi';
import type { Task } from '../../types';
import Calendar from '../../components/organisms/Calendar/Calendar';
import TaskItem from '../../components/molecules/TaskItem';
import './CalendarScreen.css';

const CalendarScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  const getTasksForSelectedDate = () => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === selectedDate.toDateString();
    });
  };

  const selectedDateTasks = getTasksForSelectedDate();
  const formattedDate = selectedDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="calendar-screen">
      <header className="calendar-screen-header">
        <h1 className="calendar-screen-title">Календарь</h1>
        <p className="calendar-screen-subtitle">Планируйте свое время</p>
      </header>

      <Calendar
        tasks={tasks}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      <div className="selected-date-section">
        <h2 className="selected-date-title">
          {formattedDate}
        </h2>

        {selectedDateTasks.length === 0 ? (
          <div className="no-tasks-message">
            <div className="no-tasks-icon">📅</div>
            <p>На эту дату задач нет</p>
          </div>
        ) : (
          <div className="tasks-for-date">
            {selectedDateTasks.map(task => (
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

export default CalendarScreen;

