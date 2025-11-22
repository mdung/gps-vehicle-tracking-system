import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    onConfirm: (() => void) | null;
    onCancel: (() => void) | null;
  }>({
    isOpen: false,
    options: null,
    onConfirm: null,
    onCancel: null,
  });

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmState({
          isOpen: true,
          options,
          onConfirm: () => {
            setConfirmState({ isOpen: false, options: null, onConfirm: null, onCancel: null });
            resolve(true);
          },
          onCancel: () => {
            setConfirmState({ isOpen: false, options: null, onConfirm: null, onCancel: null });
            resolve(false);
          },
        });
      });
    },
    []
  );

  return {
    confirm,
    confirmState,
  };
}

