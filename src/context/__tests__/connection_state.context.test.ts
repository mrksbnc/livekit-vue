import {
  useConnectionStateContext,
  useMaybeConnectionStateContext,
  useProvideConnectionStateContext,
} from '@/context/connection_state.context';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';

describe('Connection State Context', () => {
  // Define mock data for connection state
  const initialConnectionState = {
    isConnecting: false,
    isConnected: true,
    isReconnecting: false,
    error: null,
  };

  // Create test components
  const ConnectionStateProvider = defineComponent({
    name: 'ConnectionStateProvider',
    props: ['initialState'],
    setup(props) {
      useProvideConnectionStateContext(props.initialState);
      return () => h('div', { id: 'provider' }, [h('slot')]);
    },
  });

  const ConnectionStateConsumer = defineComponent({
    name: 'ConnectionStateConsumer',
    setup() {
      const { state } = useConnectionStateContext();
      return () =>
        h('div', {
          id: 'consumer',
          'data-is-connected': state.connectionState.value === 'connected',
        });
    },
  });

  const MaybeConnectionStateConsumer = defineComponent({
    name: 'MaybeConnectionStateConsumer',
    setup() {
      const ctx = useMaybeConnectionStateContext();
      return () =>
        h(
          'div',
          { id: 'maybe-consumer', 'data-has-context': !!ctx },
          ctx ? ctx.state.value.isConnected.toString() : 'no-context',
        );
    },
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide and consume connection state context', () => {
    const wrapper = mount(ConnectionStateProvider, {
      props: { initialState: initialConnectionState },
      slots: { default: h(ConnectionStateConsumer) },
    });

    const consumer = wrapper.find('#consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-is-connected')).toBe('true');
  });

  it('should return undefined when using useMaybeConnectionStateContext outside provider', () => {
    const wrapper = mount(MaybeConnectionStateConsumer);

    const consumer = wrapper.find('#maybe-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-has-context')).toBe('false');
    expect(consumer.text()).toBe('no-context');
  });

  it('should return connection state when using useMaybeConnectionStateContext inside provider', () => {
    const wrapper = mount(ConnectionStateProvider, {
      props: { initialState: initialConnectionState },
      slots: { default: h(MaybeConnectionStateConsumer) },
    });

    const consumer = wrapper.find('#maybe-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-has-context')).toBe('true');
    expect(consumer.text()).toBe('true');
  });

  it('should throw error when using useConnectionStateContext outside provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => mount(ConnectionStateConsumer)).toThrow();

    errorSpy.mockRestore();
  });

  it('should handle state changes correctly', async () => {
    const wrapper = mount(ConnectionStateProvider, {
      props: { initialState: initialConnectionState },
      slots: { default: h(ConnectionStateConsumer) },
    });

    // Get the context from outside to manipulate it
    const provider = wrapper.findComponent({ name: 'ConnectionStateProvider' });

    // Simulate reconnecting state
    const vm = provider.vm as any;
    vm.$.setupState.setReconnecting(true);
    await wrapper.vm.$nextTick();

    // Find the consumer and check its state
    const consumer = wrapper.find('#consumer');
    expect(consumer.attributes('data-is-connected')).toBe('true');
  });
});
