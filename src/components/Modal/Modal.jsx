import React from 'react';
import './modal.css';

export default function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
