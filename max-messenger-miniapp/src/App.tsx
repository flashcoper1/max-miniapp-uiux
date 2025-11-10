// src/App.tsx

import {useState, useCallback, type JSX} from 'react';
import { MaxUI } from '@maxhub/max-ui'; // `Button` здесь больше не нужен
import { TaskListScreen } from './screens/TaskListScreen';
import { TaskFormOrganism } from './organisms/TaskFormOrganism';
import { taskApi } from './api/taskApi';
import { type Task } from './types';

type View =
    | { screen: 'LIST' }
    | { screen: 'FORM'; task?: Task };

export const App = (): JSX.Element => {
    const [view, setView] = useState<View>({ screen: 'LIST' });
    const [refreshKey, setRefreshKey] = useState(0);

    const handleShowForm = useCallback((task?: Task) => {
        setView({ screen: 'FORM', task });
    }, []);

    const handleCloseForm = useCallback(() => {
        setView({ screen: 'LIST' });
    }, []);

    const handleSubmitForm = useCallback(async (values: { title: string; description: string }) => {
        if (view.screen !== 'FORM') return;

        if (view.task) {
            await taskApi.update({ ...view.task, ...values });
        } else {
            await taskApi.create(values);
        }

        setView({ screen: 'LIST' });
        setRefreshKey(key => key + 1);
    }, [view]);

    return (
        <MaxUI platform="ios" colorScheme="light">
            {view.screen === 'LIST' && (
                <TaskListScreen
                    key={refreshKey}
                    onAddTask={() => handleShowForm()}
                    // Исправление: Явно указываем тип для `task`.
                    onEditTask={(task: Task) => handleShowForm(task)}
                />
            )}

            {view.screen === 'FORM' && (
                <TaskFormOrganism
                    initialData={view.task}
                    onSubmit={handleSubmitForm}
                    onCancel={handleCloseForm}
                />
            )}
        </MaxUI>
    );
};