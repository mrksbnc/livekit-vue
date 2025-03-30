import { createInjectionState } from '@vueuse/core';
import { ref, type Ref } from 'vue';
import { MissingContextError } from './error';

export type ToastMessage = {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timeout?: number;
};

export type ToastContext = {
  messages: Ref<ToastMessage[]>;
  add: (message: Omit<ToastMessage, 'id'>) => string;
  remove: (id: string) => void;
  clear: () => void;
};

const [useProvideToastContext, useToastContextRaw] = createInjectionState((): ToastContext => {
  const messages = ref<ToastMessage[]>([]);

  const add = (message: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    const newMessage = { ...message, id };
    messages.value = [...messages.value, newMessage];

    if (message.timeout) {
      setTimeout(() => {
        remove(id);
      }, message.timeout);
    }

    return id;
  };

  const remove = (id: string) => {
    messages.value = messages.value.filter((m) => m.id !== id);
  };

  const clear = () => {
    messages.value = [];
  };

  return {
    messages,
    add,
    remove,
    clear,
  };
});

export { useProvideToastContext, useToastContextRaw };

export function useMaybeToastContext(): ToastContext | undefined {
  return useToastContextRaw();
}

export function useToastContext(): ToastContext {
  const context = useMaybeToastContext();

  if (!context) {
    throw new MissingContextError(
      'Please call `useProvideToastContext` on the appropriate parent component',
    );
  }

  return context;
}
