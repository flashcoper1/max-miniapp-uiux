import React, { useState, useEffect } from 'react';
import { taskApi } from '../../api/taskApi';
import type { Task } from '../../types';
import Calendar from '../../components/organisms/Calendar/Calendar';
import TaskItem from '../../components/molecules/TaskItem';
import TaskForm from './TaskForm';
import { formatTime } from '../../utils/date';
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

  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    // open task detail panel
    setSelectedTaskDetail(task);
  };

  useEffect(() => {
    // close any open task detail when date changes
    if (selectedDate) {
      // animate closing if modal is open
      if (modalOpen) {
        setModalOpen(false);
        setTimeout(() => setSelectedTaskDetail(null), 260);
      } else {
        setSelectedTaskDetail(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTaskDetail) {
      // when a task is set, open modal with animation
      setTimeout(() => setModalOpen(true), 8);
    } else {
      setModalOpen(false);
    }
  }, [selectedTaskDetail]);

  const closeTaskDetail = () => {
    // play closing animation then remove detail
    setModalOpen(false);
    setTimeout(() => setSelectedTaskDetail(null), 260);
  };

  const getTasksForSelectedDate = () => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === selectedDate.toDateString();
    });
  };

  const selectedDateTasks = getTasksForSelectedDate();
  // sort tasks by time within the selected date
  selectedDateTasks.sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  const formattedDate = selectedDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="calendar-screen">
      <header className="calendar-screen-header">
        <div className="calendar-current-date">{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <h1 className="calendar-screen-title">Сегодня</h1>
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
        {/* Task detail modal: opens on task click */}
        {selectedTaskDetail && (
          <div className={`task-modal-overlay ${modalOpen ? 'open' : 'closing'}`} onClick={closeTaskDetail}>
              <div className={`task-modal ${modalOpen ? 'open' : 'closing'}`} onClick={(e) => e.stopPropagation()}>
                <div className="task-modal-header">
                  <div className="task-modal-title">Редактировать задачу</div>
                  <div className="task-modal-avatar">
                    {/* placeholder avatar */}
                    <div className="avatar"> </div>
                  </div>
                </div>
                <div className="task-modal-body">
                  <TaskForm
                    task={selectedTaskDetail}
                    onCancel={closeTaskDetail}
                    onSave={(updates) => {
                      // save then animate close
                      taskApi.updateTask(selectedTaskDetail.id, updates);
                      loadTasks();
                      setModalOpen(false);
                      setTimeout(() => setSelectedTaskDetail(null), 260);
                    }}
                  />
                </div>
              </div>
          </div>
        )}

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
                timeLabel={formatTime(task.dueDate) || undefined}
                showDate={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarScreen;

