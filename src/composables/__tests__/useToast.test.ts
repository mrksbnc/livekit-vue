import { useToast } from '@/composables/useToast';
import * as toastContext from '@/context/toast.context';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

// Mock dependencies
vi.mock('@/context/toast.context', () => ({
  useToastContext: vi.fn(),
}));

describe('useToast', () => {
  // Mock toast messages
  const mockToastMessages = ref([
    { id: 'toast-1', message: 'Test message 1', type: 'info', timeout: 5000 },
    { id: 'toast-2', message: 'Test message 2', type: 'error', timeout: 3000 },
  ]);

  // Mock toast context
  const mockToastContext = {
    messages: mockToastMessages,
    add: vi.fn().mockImplementation((toast) => `toast-${Date.now()}`),
    remove: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(toastContext, 'useToastContext').mockReturnValue(mockToastContext);
  });

  it('should provide access to toast messages', () => {
    const { messages } = useToast();

    expect(messages.value).toEqual(mockToastMessages.value);
    expect(toastContext.useToastContext).toHaveBeenCalled();
  });

  it('should add a toast with default parameters', () => {
    const { addToast } = useToast();

    const toastId = addToast('Test message');

    expect(mockToastContext.add).toHaveBeenCalledWith({
      message: 'Test message',
      type: 'info',
      timeout: 5000,
    });
    expect(typeof toastId).toBe('string');
  });

  it('should add a toast with custom parameters', () => {
    const { addToast } = useToast();

    addToast('Custom message', 'error', 10000);

    expect(mockToastContext.add).toHaveBeenCalledWith({
      message: 'Custom message',
      type: 'error',
      timeout: 10000,
    });
  });

  it('should remove a toast by id', () => {
    const { removeToast } = useToast();

    removeToast('toast-1');

    expect(mockToastContext.remove).toHaveBeenCalledWith('toast-1');
  });

  it('should clear all toasts', () => {
    const { clearToasts } = useToast();

    clearToasts();

    expect(mockToastContext.clear).toHaveBeenCalled();
  });

  it('should provide a complete toast API', () => {
    const toast = useToast();

    expect(toast).toHaveProperty('messages');
    expect(toast).toHaveProperty('addToast');
    expect(toast).toHaveProperty('removeToast');
    expect(toast).toHaveProperty('clearToasts');
  });
});
