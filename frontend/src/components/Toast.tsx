import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      backgroundColor: '#10b981',
      icon: '✓',
      borderColor: '#059669',
    },
    error: {
      backgroundColor: '#ef4444',
      icon: '✕',
      borderColor: '#dc2626',
    },
    info: {
      backgroundColor: '#3b82f6',
      icon: 'ℹ',
      borderColor: '#2563eb',
    },
    warning: {
      backgroundColor: '#f59e0b',
      icon: '⚠',
      borderColor: '#d97706',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: style.backgroundColor,
        color: 'white',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '500px',
        zIndex: 1001,
        animation: 'slideIn 0.3s ease-out',
        border: `2px solid ${style.borderColor}`,
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{style.icon}</span>
      <span style={{ flex: 1, lineHeight: '1.5' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '0',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        ×
      </button>
    </div>
  );
}

