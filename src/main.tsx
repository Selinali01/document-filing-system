import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AppProvider } from './provider';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
