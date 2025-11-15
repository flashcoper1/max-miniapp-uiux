import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Task } from '../../types';
import './CalendarScreen.css';

interface Props {
  task: Task;
  onCancel: () => void;
  onSave: (updates: Partial<Task>) => void;
}

const toDateInputValue = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toISOString().slice(0,10);
};

const toTimeInputValue = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toTimeString().slice(0,5);
};

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  date.setHours(0,0,0,0);
  return date;
};

const addDays = (d: Date, days: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
};

const formatISODate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toISOString().slice(0,10);
};

const dayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

const TaskForm: React.FC<Props> = ({ task, onCancel, onSave }) => {
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [date, setDate] = useState(toDateInputValue(task.dueDate));
  const [time, setTime] = useState(toTimeInputValue(task.dueDate));

  // prepare a range of weeks to render as horizontally scrollable blocks
  const initialWeekStart = task.dueDate ? startOfWeek(new Date(task.dueDate)) : startOfWeek(new Date());
  const weeks = useMemo(() => {
    const arr: Date[] = [];
    for (let i = -4; i <= 4; i++) {
      arr.push(addDays(initialWeekStart, i * 7));
    }
    return arr;
  }, [initialWeekStart]);

  const weekScrollRef = useRef<HTMLDivElement | null>(null);

  const handleDaySelect = (d: Date) => {
    const iso = d.toISOString().slice(0,10);
    setDate(iso);
  };

  // center the initially selected week after mount
  useEffect(() => {
    const el = weekScrollRef.current;
    if (!el) return;
    const block = el.querySelector('.week-block') as HTMLElement | null;
    if (!block) return;
    const index = weeks.findIndex(w => w.getTime() === initialWeekStart.getTime());
    const left = index * (block.getBoundingClientRect().width + 8); // gap 8
    el.scrollTo({ left, behavior: 'instant' as ScrollBehavior });
  }, [weeks, initialWeekStart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let dueDate: string | undefined = undefined;
    if (date) {
      const dt = new Date(date + 'T' + (time || '00:00'));
      dueDate = dt.toISOString();
    }
    onSave({ title, description, dueDate });
  };

  // when date input is changed manually, keep weekStart in sync
  const onDateChange = (v: string) => {
    setDate(v);
    if (v) {
      const d = new Date(v + 'T00:00');
      setWeekStart(startOfWeek(d));
    }
  };

  const isSameISO = (iso1?: string, d?: Date) => {
    if (!iso1 || !d) return false;
    return formatISODate(iso1) === d.toISOString().slice(0,10);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="week-scroller">
        <div className="week-scroll" ref={weekScrollRef}>
          {weeks.map((w, wi) => (
            <div className="week-block" key={wi}>
              {Array.from({length:7}).map((_, di) => {
                const d = addDays(w, di);
                return (
                  <button
                    key={di}
                    type="button"
                    className={`week-day ${isSameISO(task.dueDate, d) || date === d.toISOString().slice(0,10) ? 'selected' : ''}`}
                    onClick={() => handleDaySelect(d)}
                    aria-pressed={date === d.toISOString().slice(0,10)}
                  >
                    <div className="dow">{dayNames[di]}</div>
                    <div className="dom">{d.getDate()}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="date-strip">{date ? `${date} ${time ? '• ' + time : ''}` : 'Дата и время'}</div>

      <label className="field">
        <span>Название</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>

      <label className="field">
        <span>Описание</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </label>

      <div className="row">
        <label className="field small">
          <span>Дата</span>
          <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
        </label>
        <label className="field small">
          <span>Время</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>

      <div className="task-form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>Отмена</button>
        <button type="submit" className="btn primary">Сохранить</button>
      </div>
    </form>
  );
};

export default TaskForm;
