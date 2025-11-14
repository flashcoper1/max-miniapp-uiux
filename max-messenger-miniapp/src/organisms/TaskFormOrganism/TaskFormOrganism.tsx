import React, { useState } from 'react';
import type { Task } from '../../types';
import { Button, Input, Textarea, Panel } from '@maxhub/max-ui';
import './TaskFormOrganism.css';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const TaskFormOrganism: React.FC<TaskFormProps> = ({ onSubmit, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
      status: 'todo',
    });

    // Reset form
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <Panel className="task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-handle" />
          <h2>Новая задача</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Название</label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что нужно сделать?"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Добавьте детали..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Срок выполнения</label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Приоритет</label>
            <div className="priority-buttons">
              <Button
                type="button"
                mode={priority === 'low' ? 'primary' : 'secondary'}
                className={`priority-btn priority-low ${priority === 'low' ? 'active' : ''}`}
                onClick={() => setPriority('low')}
              >
                Низкий
              </Button>
              <Button
                type="button"
                mode={priority === 'medium' ? 'primary' : 'secondary'}
                className={`priority-btn priority-medium ${priority === 'medium' ? 'active' : ''}`}
                onClick={() => setPriority('medium')}
              >
                Средний
              </Button>
              <Button
                type="button"
                mode={priority === 'high' ? 'primary' : 'secondary'}
                className={`priority-btn priority-high ${priority === 'high' ? 'active' : ''}`}
                onClick={() => setPriority('high')}
              >
                Высокий
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            mode="primary"
            className="submit-btn"
            disabled={!title.trim()}
          >
            Создать задачу
          </Button>
        </form>
      </Panel>
    </div>
  );
};

export default TaskFormOrganism;
