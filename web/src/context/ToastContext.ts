import { createContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

export interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

