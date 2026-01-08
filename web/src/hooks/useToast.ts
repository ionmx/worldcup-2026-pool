import { use } from 'react';
import { ToastContext, type ToastContextType } from '../context';

export const useToast = (): ToastContextType => {
  const context = use(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
