import React from 'react';
import { Button } from './Button';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-sm border border-white/20 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          background:
            'linear-gradient(to bottom, rgba(30,30,30,0.95), rgba(20,20,20,0.98))',
        }}
      >
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/70 mb-6">{message}</p>

        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex-1 py-3"
          >
            {cancelText}
          </Button>
          <Button onClick={onConfirm} className="flex-1 py-3">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Hook for easier usage
type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmState = ConfirmOptions & {
  isOpen: boolean;
};

type UseConfirmReturn = {
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  ConfirmDialogComponent: React.ReactNode;
};

export const useConfirm = (): UseConfirmReturn => {
  const [state, setState] = React.useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
  });
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const showConfirm = React.useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setState({
          ...options,
          isOpen: true,
        });
      });
    },
    []
  );

  const handleConfirm = React.useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleCancel = React.useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmDialogComponent = React.useMemo(
    () => (
      <ConfirmDialog
        isOpen={state.isOpen}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
    [state, handleConfirm, handleCancel]
  );

  return { showConfirm, ConfirmDialogComponent };
};
