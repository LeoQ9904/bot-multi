export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const toasts = ref<Toast[]>([]);
let toastId = 0;

export const useToast = () => {
  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = toastId++;
    toasts.value.push({ id, message, type });
    
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    }, duration);
  };

  const success = (message: string) => show(message, 'success');
  const error = (message: string) => show(message, 'error');
  const info = (message: string) => show(message, 'info');
  const warning = (message: string) => show(message, 'warning');

  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    info,
    warning
  };
};
