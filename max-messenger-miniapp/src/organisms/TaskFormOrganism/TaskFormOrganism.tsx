// src/organisms/TaskFormOrganism/TaskFormOrganism.tsx

import React, { useCallback, useEffect, useId, useReducer, useRef } from 'react';
import {
    Button,
    CellHeader,
    CellList,
    Container,
    Flex,
    Input,
    Panel,
    Spinner,
    Textarea,
    Typography,
} from '@maxhub/max-ui';

// --- Типизация ---
interface FormValues {
    title: string;
    description: string;
}

interface FormErrors {
    title?: string;
}

type State = {
    values: FormValues;
    touched: { [K in keyof FormValues]?: boolean };
    errors: FormErrors;
    status: 'idle' | 'submitting' | 'error';
    submissionError: string | null;
};

type Action =
    | { type: 'SET_FIELD_VALUE'; payload: { field: keyof FormValues; value: string } }
    | { type: 'SET_FIELD_TOUCHED'; payload: { field: keyof FormValues } }
    | { type: 'SUBMIT_START' }
    | { type: 'SUBMIT_SUCCESS' }
    | { type: 'SUBMIT_ERROR'; payload: string };

export interface TaskFormOrganismProps {
    initialData?: Partial<FormValues>;
    onSubmit: (values: FormValues) => Promise<void>;
    onCancel: () => void;
    className?: string;
}

// --- Логика Валидации ---
const validate = (values: FormValues): FormErrors => {
    const errors: FormErrors = {};
    if (!values.title.trim()) {
        errors.title = 'Название задачи не может быть пустым';
    }
    return errors;
};

// --- Редьюсер ---
const formReducer = (state: State, action: Action): State => {
    // ... (логика редьюсера без изменений)
    switch (action.type) {
        case 'SET_FIELD_VALUE': {
            const newValues = { ...state.values, [action.payload.field]: action.payload.value };
            const newErrors = state.touched[action.payload.field] ? validate(newValues) : state.errors;
            return { ...state, values: newValues, errors: newErrors };
        }
        case 'SET_FIELD_TOUCHED': {
            const field = action.payload.field;
            if (state.touched[field]) return state;
            const newTouched = { ...state.touched, [field]: true };
            const newErrors = validate(state.values);
            return { ...state, touched: newTouched, errors: { ...state.errors, ...newErrors } };
        }
        case 'SUBMIT_START': {
            const errors = validate(state.values);
            const allTouched = { title: true, description: true };
            if (Object.keys(errors).length > 0) {
                return { ...state, errors, touched: allTouched };
            }
            return { ...state, status: 'submitting', submissionError: null };
        }
        case 'SUBMIT_SUCCESS':
            return { ...state, status: 'idle' };
        case 'SUBMIT_ERROR':
            return { ...state, status: 'error', submissionError: action.payload };
        default:
            return state;
    }
};

// --- Компонент-Организм ---
export const TaskFormOrganism = ({ initialData, onSubmit, onCancel, className }: TaskFormOrganismProps) => {
    const initialState: State = {
        values: { title: '', description: '', ...initialData },
        touched: {},
        errors: {},
        status: 'idle',
        submissionError: null,
    };
    const [state, dispatch] = useReducer(formReducer, initialState);
    const { values, touched, errors, status, submissionError } = state;

    const titleErrorId = useId();
    const submissionErrorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (status === 'error') {
            submissionErrorRef.current?.focus();
        }
    }, [status]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        dispatch({ type: 'SET_FIELD_VALUE', payload: { field: e.target.name as keyof FormValues, value: e.target.value } });
    }, []);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        dispatch({ type: 'SET_FIELD_TOUCHED', payload: { field: e.target.name as keyof FormValues } });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'SUBMIT_START' });

        const currentErrors = validate(values);
        if (Object.keys(currentErrors).length > 0) return;

        try {
            await onSubmit(values);
            dispatch({ type: 'SUBMIT_SUCCESS' });
        } catch (error) {
            const message = (error as Error).message || 'Произошла неизвестная ошибка';
            dispatch({ type: 'SUBMIT_ERROR', payload: message });
        }
    };

    const isSubmitting = status === 'submitting';

    return (
        <Panel mode="secondary" className={className}>
            <form onSubmit={handleSubmit} noValidate>
                <CellList mode="island">
                    <CellHeader titleStyle="normal">
                        <Typography.Headline variant="large-strong">
                            {initialData ? 'Редактировать задачу' : 'Новая задача'}
                        </Typography.Headline>
                    </CellHeader>

                    <div style={{ padding: '12px 16px', background: 'var(--background-surface-card)' }}>
                        <Flex direction="column" gap={16}>
                            <div>
                                <Input
                                    name="title"
                                    placeholder="Название задачи"
                                    value={values.title}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isSubmitting}
                                    aria-describedby={errors.title ? titleErrorId : undefined}
                                    aria-invalid={!!errors.title}
                                />
                                {touched.title && errors.title && (
                                    <Typography.Body
                                        id={titleErrorId}
                                        variant="small"
                                        style={{ color: 'var(--text-negative)', marginTop: '4px', paddingLeft: '12px' }}
                                        role="alert"
                                    >
                                        {errors.title}
                                    </Typography.Body>
                                )}
                            </div>
                            <Textarea
                                name="description"
                                placeholder="Описание (необязательно)"
                                value={values.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={isSubmitting}
                                rows={4}
                            />
                        </Flex>
                    </div>
                </CellList>

                {submissionError && (
                    <div
                        ref={submissionErrorRef}
                        tabIndex={-1}
                        style={{ padding: '12px 16px', outline: 'none' }}
                        role="alert"
                    >
                        <Typography.Body variant="medium" style={{ color: 'var(--text-negative)' }}>
                            Ошибка: {submissionError}
                        </Typography.Body>
                    </div>
                )}

                <Container style={{ marginTop: '24px' }}>
                    <Flex gap={12}>
                        <Button type="button" size="large" mode="secondary" appearance="neutral" stretched onClick={onCancel} disabled={isSubmitting}>
                            Отмена
                        </Button>
                        <Button type="submit" size="large" stretched disabled={isSubmitting}>
                            {isSubmitting ? <Spinner appearance="contrast-static" size={24} /> : 'Сохранить'}
                        </Button>
                    </Flex>
                </Container>
            </form>
        </Panel>
    );
};

TaskFormOrganism.displayName = 'TaskFormOrganism';