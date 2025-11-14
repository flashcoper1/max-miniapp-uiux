import React, { useState, useEffect } from 'react';
import { Panel, Input, Textarea, Button, IconButton } from '@maxhub/max-ui';
import type { Task } from '../../../types';
import './TaskFormOrganism.css';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

type Priority = 'low' | 'medium' | 'high';

const TaskFormOrganism: React.FC<TaskFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 220); // Match animation duration (0.22s)
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'todo',
      dueDate: dueDate || undefined,
    });

    handleClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`task-form-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <Panel
        className={`task-form-panel ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="form-header">
          <h2 className="form-title">Новая задача</h2>
          <IconButton
            mode="tertiary"
            className="form-close-btn"
            onClick={handleClose}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </IconButton>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="form-content">
          {/* Title */}
          <div className="form-group">
            <label className="form-label required">Название задачи</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Написать отчёт"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Описание</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Добавьте детали задачи..."
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">Приоритет</label>
            <div className="priority-group">
              <Button
                type="button"
                mode="secondary"
                className={`priority-btn ${priority === 'low' ? 'active' : ''}`}
                data-priority="low"
                onClick={() => setPriority('low')}
              >
                Низкий
              </Button>
              <Button
                type="button"
                mode="secondary"
                className={`priority-btn ${priority === 'medium' ? 'active' : ''}`}
                data-priority="medium"
                onClick={() => setPriority('medium')}
              >
                Средний
              </Button>
              <Button
                type="button"
                mode="secondary"
                className={`priority-btn ${priority === 'high' ? 'active' : ''}`}
                data-priority="high"
                onClick={() => setPriority('high')}
              >
                Высокий
              </Button>
            </div>
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label">Срок выполнения</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Button
              type="button"
              mode="secondary"
              className="form-btn form-btn-cancel"
              onClick={handleClose}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              mode="primary"
              className="form-btn form-btn-submit"
              disabled={!title.trim()}
            >
              Создать задачу
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
};

export default TaskFormOrganism;

