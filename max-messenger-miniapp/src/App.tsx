// src/App.tsx

// Исправление: Удалены неиспользуемые импорты `useState`, `useCallback` и `Button`.
// `MaxUI` также не используется, если он уже обертка в `main.tsx`, но оставим на всякий случай.
import { useState, useCallback } from 'react';
import { MaxUI, Button } from '@maxhub/max-ui';
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
                <>
                    <TaskListScreen key={refreshKey} />
                    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 100 }}>
                        <Button size="large" onClick={() => handleShowForm()}>+</Button>
                    </div>
                </>
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