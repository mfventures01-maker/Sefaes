import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { env } from './config/env';
import { setupSupabaseStubs } from './tests/mockDb';

let shouldMock = false;
if (typeof window !== 'undefined') {
    if (window.location.search.includes('mock=true')) {
        localStorage.setItem('sefaes_mock', 'true');
        shouldMock = true;
    } else if (window.location.search.includes('mock=false')) {
        localStorage.removeItem('sefaes_mock');
        shouldMock = false;
    } else {
        shouldMock = localStorage.getItem('sefaes_mock') === 'true';
    }
}

if (!shouldMock) {
    shouldMock = env.VITE_SUPABASE_URL.includes('sefaes-temp-mock-url') ||
                 env.VITE_SUPABASE_URL.includes('placeholder');
}

if (shouldMock) {
    console.log('[SEFAES] Local/Mock environment detected. Initializing database and auth stubs...');
    setupSupabaseStubs();
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);