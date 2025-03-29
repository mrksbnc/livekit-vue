import { useProvideToastContext, useToastContext } from '@/context/toast.context';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';

describe('Toast Context', () => {
  // Create test components
  const ToastProvider = defineComponent({
    name: 'ToastProvider',
    setup() {
      const { addToast, removeToast, toasts } = useProvideToastContext();

      return () =>
        h('div', { id: 'provider' }, [
          h(
            'button',
            {
              id: 'add-toast',
              onClick: () => addToast({ id: 'test-toast', message: 'Test message', type: 'info' }),
            },
            'Add Toast',
          ),
          h(
            'button',
            {
              id: 'remove-toast',
              onClick: () => removeToast('test-toast'),
            },
            'Remove Toast',
          ),
          h('div', { id: 'toast-count' }, toasts.value.length.toString()),
          h('slot'),
        ]);
    },
  });

  const ToastConsumer = defineComponent({
    name: 'ToastConsumer',
    setup() {
      const { toasts, addToast, removeToast } = useToastContext();

      return () =>
        h(
          'div',
          {
            id: 'consumer',
            'data-toast-count': toasts.value.length.toString(),
          },
          [
            h(
              'button',
              {
                id: 'consumer-add-toast',
                onClick: () =>
                  addToast({ id: 'consumer-toast', message: 'Consumer message', type: 'error' }),
              },
              'Add Consumer Toast',
            ),
            h(
              'button',
              {
                id: 'consumer-remove-toast',
                onClick: () => removeToast('consumer-toast'),
              },
              'Remove Consumer Toast',
            ),
          ],
        );
    },
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide and consume toast context', () => {
    const wrapper = mount(ToastProvider, {
      slots: { default: h(ToastConsumer) },
    });

    // Check if components are rendered correctly
    const provider = wrapper.find('#provider');
    const consumer = wrapper.find('#consumer');
    expect(provider.exists()).toBe(true);
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-toast-count')).toBe('0');
  });

  it('should add toast from provider and reflect in consumer', async () => {
    const wrapper = mount(ToastProvider, {
      slots: { default: h(ToastConsumer) },
    });

    // Add a toast from provider
    await wrapper.find('#add-toast').trigger('click');

    // Check if toast count is updated in both provider and consumer
    expect(wrapper.find('#toast-count').text()).toBe('1');
    expect(wrapper.find('#consumer').attributes('data-toast-count')).toBe('1');
  });

  it('should add toast from consumer and reflect in provider', async () => {
    const wrapper = mount(ToastProvider, {
      slots: { default: h(ToastConsumer) },
    });

    // Add a toast from consumer
    await wrapper.find('#consumer-add-toast').trigger('click');

    // Check if toast count is updated in both provider and consumer
    expect(wrapper.find('#toast-count').text()).toBe('1');
    expect(wrapper.find('#consumer').attributes('data-toast-count')).toBe('1');
  });

  it('should remove toast from provider and reflect in consumer', async () => {
    const wrapper = mount(ToastProvider, {
      slots: { default: h(ToastConsumer) },
    });

    // Add and then remove a toast
    await wrapper.find('#add-toast').trigger('click');
    await wrapper.find('#remove-toast').trigger('click');

    // Check if toast count is updated in both provider and consumer
    expect(wrapper.find('#toast-count').text()).toBe('0');
    expect(wrapper.find('#consumer').attributes('data-toast-count')).toBe('0');
  });

  it('should remove toast from consumer and reflect in provider', async () => {
    const wrapper = mount(ToastProvider, {
      slots: { default: h(ToastConsumer) },
    });

    // Add and then remove a toast from consumer
    await wrapper.find('#consumer-add-toast').trigger('click');
    await wrapper.find('#consumer-remove-toast').trigger('click');

    // Check if toast count is updated in both provider and consumer
    expect(wrapper.find('#toast-count').text()).toBe('0');
    expect(wrapper.find('#consumer').attributes('data-toast-count')).toBe('0');
  });

  it('should throw error when using useToastContext outside provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => mount(ToastConsumer)).toThrow();

    errorSpy.mockRestore();
  });
});
