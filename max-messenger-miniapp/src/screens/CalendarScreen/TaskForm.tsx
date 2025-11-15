import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Task } from '../../types';
import './CalendarScreen.css';

interface Props {
  task: Task;
  onCancel: () => void;
  onSave: (updates: Partial<Task>) => void;
}

const pad2 = (n: number) => n < 10 ? '0' + n : String(n);

const formatYMD = (d: Date) => {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const toDateInputValue = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return formatYMD(d);
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

const isoToYMD = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return formatYMD(d);
};

const dayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

const TaskForm: React.FC<Props> = ({ task, onCancel, onSave }) => {
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [date, setDate] = useState(toDateInputValue(task.dueDate));
  const [time, setTime] = useState(toTimeInputValue(task.dueDate));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState<number>(() => {
    if (!time) return 0;
    return parseInt(time.split(':')[0], 10) || 0;
  });
  const [tempMinute, setTempMinute] = useState<number>(() => {
    if (!time) return 0;
    return parseInt(time.split(':')[1], 10) || 0;
  });

  // prepare a range of weeks to render as horizontally scrollable blocks
  const initialWeekStart = useMemo(() => {
    return task.dueDate ? startOfWeek(new Date(task.dueDate)) : startOfWeek(new Date());
  }, [task.dueDate]);

  const weeks = useMemo(() => {
    const arr: Date[] = [];
    for (let i = -4; i <= 4; i++) {
      arr.push(addDays(initialWeekStart, i * 7));
    }
    return arr;
  }, [initialWeekStart]);

  const weekScrollRef = useRef<HTMLDivElement | null>(null);
  const hourColRef = useRef<HTMLDivElement | null>(null);
  const minuteColRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [debugRects, setDebugRects] = useState<{ overlay?: string; picker?: string }>({});

  const handleDaySelect = (d: Date) => {
    const ymd = formatYMD(d);
    setDate(ymd);
  };

  // center the initially selected week once after mount
  useEffect(() => {
    const el = weekScrollRef.current;
    if (!el) return;
    const block = el.querySelector('.week-block') as HTMLElement | null;
    if (!block) return;
    const index = weeks.findIndex(w => w.getTime() === initialWeekStart.getTime());
    const left = index * (block.getBoundingClientRect().width + 8); // gap 8
    el.scrollTo({ left, behavior: 'instant' as ScrollBehavior });
    // Intentionally run only on mount / when initialWeekStart changes
    // (initialWeekStart is memoized based on task.dueDate)
    // do not re-run on `date` changes to avoid snapping back when user selects another day
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let dueDate: string | undefined = undefined;
    if (date) {
      const dt = new Date(date + 'T' + (time || '00:00'));
      dueDate = dt.toISOString();
    }
    onSave({ title, description, dueDate });
  };

  const openTimePicker = () => {
    const [h, m] = (time || '00:00').split(':');
    setTempHour(parseInt(h, 10) || 0);
    setTempMinute(parseInt(m, 10) || 0);
    setShowTimePicker(true);
  };

  // when time picker opens, scroll columns to the selected items
  useEffect(() => {
    if (!showTimePicker) return;
    console.log('Time picker opened');
    // small on-screen debug label for devices without DevTools
    try {
      let dbg = document.getElementById('tp-debug-log');
      if (!dbg) {
        dbg = document.createElement('div');
        dbg.id = 'tp-debug-log';
        dbg.style.position = 'fixed';
        dbg.style.left = '12px';
        dbg.style.top = '12px';
        dbg.style.zIndex = '2147483645';
        dbg.style.background = 'rgba(0,0,0,0.6)';
        dbg.style.color = '#fff';
        dbg.style.padding = '6px 10px';
        dbg.style.borderRadius = '6px';
        dbg.style.fontSize = '12px';
        dbg.style.pointerEvents = 'none';
        document.body.appendChild(dbg);
      }
      dbg.textContent = 'Time picker opened';
    } catch (e) {
      /* ignore DOM errors */
    }
    // prevent body scroll while picker open
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    // wait for DOM to render
    const t = setTimeout(() => {
      const hsel = hourColRef.current?.querySelector('.time-item.selected') as HTMLElement | null;
      const msel = minuteColRef.current?.querySelector('.time-item.selected') as HTMLElement | null;
      hsel?.scrollIntoView({ block: 'center', behavior: 'auto' });
      msel?.scrollIntoView({ block: 'center', behavior: 'auto' });
    }, 50);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      try {
        const dbg = document.getElementById('tp-debug-log');
        if (dbg) dbg.textContent = 'Time picker closing';
      } catch (e) {}
    };
  }, [showTimePicker]);

  // collect bounding rects for debugging and display a small badge
  useEffect(() => {
    if (!showTimePicker) {
      setDebugRects({});
      try { const dbg = document.getElementById('tp-debug-log'); if (dbg) { dbg.textContent = 'Time picker closed'; setTimeout(() => dbg.remove(), 800); } } catch (e) {}
      return;
    }
    const id = setTimeout(() => {
      try {
        const or = overlayRef.current?.getBoundingClientRect();
        const pr = pickerRef.current?.getBoundingClientRect();
        setDebugRects({ overlay: or ? `${Math.round(or.x)},${Math.round(or.y)} ${Math.round(or.width)}x${Math.round(or.height)}` : undefined,
                        picker: pr ? `${Math.round(pr.x)},${Math.round(pr.y)} ${Math.round(pr.width)}x${Math.round(pr.height)}` : undefined });
        console.log('DEBUG rect overlay:', or);
        console.log('DEBUG rect picker:', pr);
        try { const dbg = document.getElementById('tp-debug-log'); if (dbg) dbg.textContent = `OV:${or ? Math.round(or.width)+'x'+Math.round(or.height) : '—'} PK:${pr ? Math.round(pr.width)+'x'+Math.round(pr.height) : '—'}`; } catch (e) {}
      } catch (e) {
        console.log('DEBUG rect error', e);
      }
    }, 120);
    return () => clearTimeout(id);
  }, [showTimePicker]);

  // log when time picker closes for diagnostics
  useEffect(() => {
    if (!showTimePicker) {
      console.log('Time picker closed');
    }
  }, [showTimePicker]);

  const confirmTime = () => {
    setTime(`${pad2(tempHour)}:${pad2(tempMinute)}`);
    setShowTimePicker(false);
  };

  const cancelTime = () => {
    setShowTimePicker(false);
  };

  // when date input is changed manually, keep weekStart in sync
  const onDateChange = (v: string) => {
    setDate(v);
    // no automatic scrolling; keep date state only
  };

  const isSameISO = (iso1?: string, d?: Date) => {
    if (!iso1 || !d) return false;
    return isoToYMD(iso1) === formatYMD(d);
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
                      className={`week-day ${isSameISO(task.dueDate, d) || date === formatYMD(d) ? 'selected' : ''}`}
                      onClick={() => handleDaySelect(d)}
                      aria-pressed={date === formatYMD(d)}
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

      <div className="date-strip">{date ? `${date} ${time ? '• ' + time : '• —:—'}` : 'Дата и время'}</div>

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
          <button type="button" className="date-input" onClick={() => {
            const el = weekScrollRef.current;
            if (el) el.focus();
          }}>
            {date ? date.split('-').reverse().join(' . ') : 'Выберите дату'}
          </button>
        </label>
        <label className="field small">
          <span>Время</span>
          <button type="button" className="time-input" onClick={openTimePicker} aria-haspopup="dialog">
            {time || '—:—'}
          </button>
        </label>
      </div>

      {showTimePicker && createPortal(
        <div className="time-picker-overlay" role="dialog" aria-modal="true" ref={overlayRef}>
          <div className={"time-picker debug"} aria-label="Time picker" ref={pickerRef}>
            <div className="time-columns">
              <div className="time-column" ref={hourColRef}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className={`time-item ${i === tempHour ? 'selected' : ''}`}
                    onClick={() => setTempHour(i)}
                  >
                    {pad2(i)}
                  </div>
                ))}
              </div>
              <div className="time-column" ref={minuteColRef}>
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={i}
                    className={`time-item ${i === tempMinute ? 'selected' : ''}`}
                    onClick={() => setTempMinute(i)}
                  >
                    {pad2(i)}
                  </div>
                ))}
              </div>
            </div>
            <div className="time-picker-actions">
              <button type="button" className="btn ghost" onClick={cancelTime}>Отмена</button>
              <button type="button" className="btn primary" onClick={confirmTime}>Готово</button>
            </div>
            {/* debug badge rendered inside portal so it is on top */}
            <div className="time-picker-debug-badge">
              <div>overlay: {debugRects.overlay || '—'}</div>
              <div>picker: {debugRects.picker || '—'}</div>
            </div>
            {/* Fixed debug element appended inside portal to test stacking */}
            <div className="time-picker-fixed-debug" aria-hidden="true">FIXED DEBUG BOX</div>
          </div>
        </div>,
        // render overlay into document body to avoid being clipped by modal transforms
        document.body
      )}
      
      <div className="task-form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>Отмена</button>
        <button type="submit" className="btn primary">Сохранить</button>
      </div>
    </form>
  );
};

export default TaskForm;
