import React from 'react';
import { createPortal } from 'react-dom';
import { ToastContext, type Toast, type ToastVariant } from './ToastContext';

const TOAST_DURATION = 3000;

const variantBorders: Record<ToastVariant, string> = {
  success: 'border-emerald-500/70',
  error: 'border-red-500/70',
  info: 'border-white/30',
};

const variantIcons: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const ToastItem = ({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) => {
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, TOAST_DURATION - 300);

    const removeTimer = setTimeout(() => {
      onRemove();
    }, TOAST_DURATION);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [onRemove]);

  return (
    <div
      className={`
        flex items-center justify-center gap-2 px-4 py-3 rounded-lg
        border bg-black/50 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]
        transform transition-all duration-300 ease-out
        w-full sm:w-auto text-white
        ${variantBorders[toast.variant]}
        ${isExiting ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}
      `}
      style={{
        animation: isExiting ? undefined : 'slideDown 0.3s ease-out',
      }}
    >
      <span className="text-lg">{variantIcons[toast.variant]}</span>
      <span className="font-medium text-sm">{toast.message}</span>
    </div>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed top-0 left-0 right-0 p-3 sm:top-4 sm:right-4 sm:left-auto sm:p-0 z-[200] flex flex-col gap-2 items-stretch sm:items-end pointer-events-none">
          <style>
            {`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-16px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext>
  );
};
