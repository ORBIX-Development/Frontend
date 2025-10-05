import React, { useState, useCallback } from 'react';
import ToastContext from './ToastContext.js';
import './toast.css';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((t) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, ...t }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), (t.duration || 3500));
  }, []);

  const value = { push };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === 'error' ? 'error' : 'success'}`}>
            {t.title && <div className="title">{t.title}</div>}
            <div className="message">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
