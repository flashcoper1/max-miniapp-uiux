import React from 'react';
import type { Task } from '../../../types';
import { IconButton } from '@maxhub/max-ui';
import { formatDate } from '../../../utils/date';
import './TaskItem.css';
import { useState, useRef, useEffect } from 'react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
  timeLabel?: string;
  showDate?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onClick, timeLabel, showDate = true }) => {
  const priorityClass = `priority-${task.priority}`;
  const statusClass = `status-${task.status}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);


  return (
    <div className={`task-item ${statusClass}`} data-priority={task.priority} onClick={() => onClick(task)}>
      <div className={`priority-indicator ${priorityClass}`} />

      <div className="task-checkbox" onClick={(e) => {
        e.stopPropagation();
        onToggle(task.id);
      }}>
        <div className={`checkbox ${task.status === 'completed' ? 'checked' : ''}`}>
          {task.status === 'completed' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>

      <div className="task-content">
        <h3 className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        {timeLabel ? (
          <span className="task-date">{timeLabel}</span>
        ) : (
          task.dueDate && showDate && (
            <span className="task-date">
              📅 {formatDate(task.dueDate)}
            </span>
          )
        )}
      </div>

      <div className="task-actions" ref={menuRef}>
        <IconButton
          className="task-menu-btn"
          mode="tertiary"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(prev => !prev);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </IconButton>

        {menuOpen && (
          <div className="task-menu">
            <button
              className="task-menu-item"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                // Placeholder for edit action
                console.log('Edit task', task.id);
                alert('Редактировать: ' + task.title);
              }}
            >Изменить</button>
            <button
              className="task-menu-item"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                if (confirm('Удалить задачу?')) {
                  onDelete(task.id);
                }
              }}
            >Удалить</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;

