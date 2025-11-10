// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// БЫЛО:
// import App from './App';

// СТАЛО (правильно для именованного экспорта):
import { App } from './App';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);