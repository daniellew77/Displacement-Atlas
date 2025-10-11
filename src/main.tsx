import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Expose IOM cache utilities to window for easy console access
import './utils/iom-cache-loader';
import './utils/iom-year-helper';
import { loadIOMCacheFromPublic } from './utils/iom-cache-loader';

// Auto-load IOM cache on app startup (non-blocking)
loadIOMCacheFromPublic().catch(err => {
  console.warn('Failed to auto-load IOM cache:', err);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);