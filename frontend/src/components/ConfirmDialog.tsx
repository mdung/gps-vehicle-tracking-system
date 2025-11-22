import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: '⚠️',
      confirmColor: 'btn-warning',
      borderColor: 'border-yellow-400',
    },
    danger: {
      icon: '🗑️',
      confirmColor: 'btn-danger',
      borderColor: 'border-red-400',
    },
    info: {
      icon: 'ℹ️',
      confirmColor: 'btn-primary',
      borderColor: 'border-blue-400',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: `2px solid ${type === 'warning' ? '#fbbf24' : type === 'danger' ? '#ef4444' : '#3b82f6'}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '32px', marginRight: '12px' }}>{style.icon}</span>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
            {title}
          </h3>
        </div>
        
        <p style={{ margin: '0 0 24px 0', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            className="btn"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            {cancelText}
          </button>
          <button
            className={style.confirmColor}
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              backgroundColor: type === 'warning' ? '#f59e0b' : type === 'danger' ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 
                type === 'warning' ? '#d97706' : type === 'danger' ? '#dc2626' : '#2563eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 
                type === 'warning' ? '#f59e0b' : type === 'danger' ? '#ef4444' : '#3b82f6';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

