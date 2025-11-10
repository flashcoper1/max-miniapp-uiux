// src/components/molecules/TaskItem/TaskItem.tsx

// Исправление: `clsx` теперь установлен и будет найден.
import { clsx } from 'clsx';
import React, { useCallback, useId } from 'react';
import { Avatar, CellSimple, Dot, Flex, IconButton, Switch, Typography } from '@maxhub/max-ui';
import { type Task, type TaskPriority } from '../../../types';

// --- Вспомогательные компоненты и константы ---
const priorityMap: Record<TaskPriority, { color: 'negative' | 'themed' | 'neutral-fade', label: string }> = {
    high: { color: 'negative', label: 'Высокий приоритет' },
    medium: { color: 'themed', label: 'Средний приоритет' },
    low: { color: 'neutral-fade', label: 'Низкий приоритет' },
};

const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
    <span style={{
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: '1px',
        margin: '-1px',
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        width: '1px',
    }}>
    {children}
  </span>
);

// --- Типизация Пропсов ---
export interface TaskItemProps {
    task: Task;
    onToggleComplete: (task: Task, isCompleted: boolean) => void;
    onDelete: (task: Task) => void;
    onClick: (task: Task) => void;
    className?: string;
}

// --- Компонент-Молекула ---
export const TaskItem = React.memo((props: TaskItemProps) => {
    const { task, onToggleComplete, onDelete, onClick, className } = props;
    const switchId = useId();

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(task);
    }, [onDelete, task]);

    const handleToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onToggleComplete(task, e.target.checked);
    }, [onToggleComplete, task]);

    const handleCellClick = useCallback((e: React.MouseEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) {
            return;
        }
        onClick(task);
    }, [onClick, task]);

    return (
        <CellSimple
            as="label"
            htmlFor={switchId}
            // Исправление: `clsx` используется для объединения классов.
            className={clsx('task-item', className)}
            onClick={handleCellClick}
            before={
                <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                        id={switchId}
                        checked={task.isCompleted}
                        onChange={handleToggle}
                        aria-labelledby={`${switchId}-title`}
                    />
                </div>
            }
            title={
                <Typography.Body
                    id={`${switchId}-title`}
                    variant="medium"
                    style={{ textDecoration: task.isCompleted ? 'line-through' : 'none' }}
                >
                    {task.title}
                    <VisuallyHidden>, {priorityMap[task.priority].label}</VisuallyHidden>
                </Typography.Body>
            }
            subtitle={task.dueDate ? `До ${task.dueDate.toLocaleDateString()}` : undefined}
            after={
                <Flex align="center" gap={12}>
                    {task.assignee && (
                        <Avatar.Container size={24}>
                            <Avatar.Image src={task.assignee.avatarUrl} fallback={task.assignee.name.substring(0, 2)} />
                        </Avatar.Container>
                    )}
                    <Dot appearance={priorityMap[task.priority].color} aria-hidden="true" />
                    <IconButton
                        size="small"
                        mode="tertiary"
                        appearance="negative"
                        onClick={handleDeleteClick}
                        aria-label={`Удалить задачу '${task.title}'`}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </IconButton>
                </Flex>
            }
        />
    );
});

TaskItem.displayName = 'TaskItem';