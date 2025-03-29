import { useToastContext, type ToastMessage } from '@/context/toast.context';
import { computed, type ComputedRef } from 'vue';

export type UseToast = {
  messages: ComputedRef<ToastMessage[]>;
  addToast: (message: string, type?: ToastMessage['type'], timeout?: number) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

export function useToast(): UseToast {
  const toastContext = useToastContext();

  const messages = computed<ToastMessage[]>(() => toastContext.messages.value);

  const addToast = (
    message: string,
    type: ToastMessage['type'] = 'info',
    timeout: number = 5000,
  ): string => {
    return toastContext.add({
      message,
      type,
      timeout,
    });
  };

  const removeToast = (id: string): void => {
    toastContext.remove(id);
  };

  const clearToasts = (): void => {
    toastContext.clear();
  };

  return {
    messages,
    addToast,
    removeToast,
    clearToasts,
  };
}
