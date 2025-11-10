// src/screens/TaskListScreen/TaskListScreen.tsx

import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
    Button,
    CellHeader,
    CellList,
    Flex,
    Panel,
    Spinner,
    Typography,
} from '@maxhub/max-ui';
import { TaskItem } from '../../components/molecules/TaskItem';
import { type Task } from '../../types';
import { taskApi } from '../../api/taskApi';

// --- Типизация Пропсов ---
export interface TaskListScreenProps {
    onAddTask: () => void;
    onEditTask: (task: Task) => void;
}

// --- Машина Состояний ---
type State = {
    tasks: Task[];
    status: 'idle' | 'loading' | 'success' | 'error';
    error: Error | null;
    notification: { type: 'error', message: string } | null;
};

type Action =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: Task[] }
    | { type: 'FETCH_ERROR'; payload: Error }
    | { type: 'OPTIMISTIC_UPDATE_TASK'; payload: { task: Task; isCompleted: boolean } }
    | { type: 'REVERT_UPDATE_TASK'; payload: { originalTask: Task; error: Error } }
    | { type: 'DISMISS_NOTIFICATION' };

const initialState: State = {
    tasks: [],
    status: 'idle',
    error: null,
    notification: null,
};

const taskListReducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, status: 'loading', error: null };
        case 'FETCH_SUCCESS':
            return { ...state, status: 'success', tasks: action.payload };
        case 'FETCH_ERROR':
            return { ...state, status: 'error', error: action.payload };
        case 'OPTIMISTIC_UPDATE_TASK':
            return {
                ...state,
                tasks: state.tasks.map(t =>
                    t.id === action.payload.task.id ? { ...t, isCompleted: action.payload.isCompleted } : t
                ),
            };
        case 'REVERT_UPDATE_TASK':
            return {
                ...state,
                tasks: state.tasks.map(t =>
                    t.id === action.payload.originalTask.id ? action.payload.originalTask : t
                ),
                notification: { type: 'error', message: action.payload.error.message },
            };
        case 'DISMISS_NOTIFICATION':
            return { ...state, notification: null };
        default:
            return state;
    }
};

// --- Компонент-Организм ---
export const TaskListScreen = ({ onAddTask, onEditTask }: TaskListScreenProps) => {
    const [state, dispatch] = useReducer(taskListReducer, initialState);
    const errorButtonRef = useRef<HTMLButtonElement>(null);

    const loadTasks = useCallback(() => {
        dispatch({ type: 'FETCH_START' });
        taskApi.fetch()
            .then((tasks) => dispatch({ type: 'FETCH_SUCCESS', payload: tasks }))
            .catch((error: Error) => dispatch({ type: 'FETCH_ERROR', payload: error }));
    }, []);

    useEffect(() => {
        if (state.status === 'idle') {
            loadTasks();
        }
    }, [state.status, loadTasks]);

    useEffect(() => { if (state.status === 'error') errorButtonRef.current?.focus() }, [state.status]);

    const handleToggleComplete = useCallback(async (task: Task, isCompleted: boolean) => {
        const originalTask = { ...task };
        dispatch({ type: 'OPTIMISTIC_UPDATE_TASK', payload: { task, isCompleted } });
        try {
            await taskApi.update({ id: task.id, isCompleted });
        } catch (error) {
            dispatch({ type: 'REVERT_UPDATE_TASK', payload: { originalTask, error: error as Error } });
        }
    }, []);

    const handleTaskClick = useCallback((task: Task) => {
        onEditTask(task);
    }, [onEditTask]);

    const handleDelete = useCallback((task: Task) => {
        console.log('Удаление задачи:', task.title);
        // Здесь должна быть реализована логика оптимистичного удаления
    }, []);

    const renderContent = () => {
        if (state.status === 'loading' && state.tasks.length === 0) {
            return (
                <Flex justify="center" align="center" style={{ height: '300px' }} aria-busy="true" aria-label="Загрузка задач">
                    <Spinner size={24} />
                </Flex>
            );
        }

        if (state.tasks.length === 0 && state.status === 'success') {
            return (
                <Flex direction="column" align="center" gap={12} style={{ padding: '20px' }}>
                    <Typography.Headline variant="medium-strong">Задач пока нет</Typography.Headline>
                    <Typography.Body variant="medium">Нажмите "+", чтобы добавить первую задачу.</Typography.Body>
                </Flex>
            );
        }

        return (
            <CellList mode="island">
                {state.tasks.map((task) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDelete}
                        onClick={handleTaskClick}
                    />
                ))}
            </CellList>
        );
    };

    return (
        <>
            <Panel mode="secondary" style={{ padding: '16px 0', minHeight: '100vh' }} aria-live="polite">
                <CellHeader titleStyle="normal" after={<Button mode="tertiary">Фильтр</Button>}>
                    <Typography.Headline variant="large-strong">Мои задачи</Typography.Headline>
                </CellHeader>

                {state.notification && (
                    <Flex role="alert" style={{ padding: '8px 16px', background: 'var(--background-accent-negative)', color: 'var(--text-contrast-static)', margin: '0 16px 12px', borderRadius: '12px' }} justify="space-between" align="center">
                        <Typography.Body variant="small-strong">{state.notification.message}</Typography.Body>
                        <Button mode="tertiary" appearance="contrast-static" size="small" onClick={() => dispatch({ type: 'DISMISS_NOTIFICATION' })}>
                            OK
                        </Button>
                    </Flex>
                )}

                {state.status === 'error' && (
                    <Flex direction="column" align="center" gap={16} style={{ padding: '20px', border: '1px solid var(--stroke-negative)', margin: '12px 16px', borderRadius: '16px' }} role="alert">
                        <Typography.Body variant="medium">Ошибка: {state.error && state.error.message}</Typography.Body>
                        <Button ref={errorButtonRef} onClick={loadTasks}>Попробовать снова</Button>
                    </Flex>
                )}

                {renderContent()}
            </Panel>
            <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 100 }}>
                <Button size="large" onClick={onAddTask}>+</Button>
            </div>
        </>
    );
};

TaskListScreen.displayName = 'TaskListScreen';