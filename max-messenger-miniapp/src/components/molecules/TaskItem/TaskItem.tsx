import React from 'react';
import type { Task } from '../../../types';
import { IconButton } from '@maxhub/max-ui';
import { formatDate } from '../../../utils/date';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onClick }) => {
  const priorityClass = `priority-${task.priority}`;
  const statusClass = `status-${task.status}`;


  return (
    <div className={`task-item ${statusClass}`} onClick={() => onClick(task)}>
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
        {task.dueDate && (
          <span className="task-date">
            📅 {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      <IconButton
        className="task-delete"
        mode="secondary"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </IconButton>
    </div>
  );
};

export default TaskItem;

