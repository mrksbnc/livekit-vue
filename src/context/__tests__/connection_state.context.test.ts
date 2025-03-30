import {
  useConnectionStateContext,
  useMaybeConnectionStateContext,
  useProvideConnectionStateContext,
} from '@/context/connection_state.context';
import { mount } from '@vue/test-utils';
import { ConnectionState } from 'livekit-client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref, type SetupContext } from 'vue';

describe('Connection State Context', () => {
  const initialConnectionStateRef = ref(ConnectionState.Connected);

  const ConnectionStateProvider = defineComponent({
    name: 'ConnectionStateProvider',
    props: ['initialStateRef'],
    setup(props, { expose, slots }: SetupContext) {
      const context = useProvideConnectionStateContext({ connectionState: props.initialStateRef });
      expose({ setConnectionState: context.setConnectionState });
      return () => (slots.default ? slots.default() : null);
    },
  });

  const ConnectionStateConsumer = defineComponent({
    name: 'ConnectionStateConsumer',
    setup() {
      const { isConnected, isConnecting, isReconnecting, isDisconnected } =
        useConnectionStateContext();
      return () =>
        h('div', {
          id: 'consumer',
          'data-is-connected': isConnected.value,
          'data-is-connecting': isConnecting.value,
          'data-is-reconnecting': isReconnecting.value,
          'data-is-disconnected': isDisconnected.value,
        });
    },
  });

  const MaybeConnectionStateConsumer = defineComponent({
    name: 'MaybeConnectionStateConsumer',
    setup() {
      const ctx = useMaybeConnectionStateContext();

      const isConnectedText = ctx ? ctx.isConnected.value.toString() : 'no-context';
      return () => h('div', { id: 'maybe-consumer', 'data-has-context': !!ctx }, isConnectedText);
    },
  });

  afterEach(() => {
    vi.clearAllMocks();
    initialConnectionStateRef.value = ConnectionState.Connected;
  });

  it('should provide and consume connection state context', async () => {
    const wrapper = mount(ConnectionStateProvider, {
      props: { initialStateRef: initialConnectionStateRef },
      slots: { default: '<ConnectionStateConsumer />' },
      global: {
        components: { ConnectionStateConsumer },
      },
    });
    await wrapper.vm.$nextTick();

    const consumer = wrapper.find('#consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-is-connected')).toBe('true');
    expect(consumer.attributes('data-is-connecting')).toBe('false');
    expect(consumer.attributes('data-is-reconnecting')).toBe('false');
    expect(consumer.attributes('data-is-disconnected')).toBe('false');
  });

  it('should return undefined when using useMaybeConnectionStateContext outside provider', () => {
    const wrapper = mount(MaybeConnectionStateConsumer);

    const consumer = wrapper.find('#maybe-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-has-context')).toBe('false');
    expect(consumer.text()).toBe('no-context');
  });

  it('should return connection state when using useMaybeConnectionStateContext inside provider', async () => {
    const wrapper = mount(ConnectionStateProvider, {
      props: { initialStateRef: initialConnectionStateRef },
      slots: { default: '<MaybeConnectionStateConsumer />' },
      global: {
        components: { MaybeConnectionStateConsumer },
      },
    });
    await wrapper.vm.$nextTick();

    const consumer = wrapper.find('#maybe-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-has-context')).toBe('true');
    expect(consumer.text()).toBe('true');
  });

  it('should throw error when using useConnectionStateContext outside provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => mount(ConnectionStateConsumer)).toThrow(
      'Please call `useProvideConnectionStateContext` on the appropriate parent component',
    );

    errorSpy.mockRestore();
  });

  it('should handle state changes correctly via setConnectionState', async () => {
    // Create a dedicated wrapper component for this test
    const TestStateChangeWrapper = defineComponent({
      name: 'TestStateChangeWrapper',
      setup(_, { expose }: SetupContext) {
        // Provide the context and expose the setter
        const { setConnectionState } = useProvideConnectionStateContext({
          connectionState: initialConnectionStateRef, // Use the ref from the outer scope
        });
        expose({ setConnectionState });
        // Render the actual consumer
        return () => h(ConnectionStateConsumer);
      },
    });

    const wrapper = mount(TestStateChangeWrapper);
    await wrapper.vm.$nextTick();

    // Access the exposed method from the wrapper's vm using double cast
    const setConnectionState = (
      wrapper.vm as unknown as { setConnectionState: (state: ConnectionState) => void }
    ).setConnectionState;

    // Now find the consumer rendered by the wrapper
    let consumer = wrapper.find('#consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-is-connected')).toBe('true');
    expect(consumer.attributes('data-is-reconnecting')).toBe('false');

    // Set state to Reconnecting
    setConnectionState(ConnectionState.Reconnecting);
    await wrapper.vm.$nextTick();

    consumer = wrapper.find('#consumer'); // Re-find after update
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-is-connected')).toBe('false');
    expect(consumer.attributes('data-is-reconnecting')).toBe('true');

    // Set state to Disconnected
    setConnectionState(ConnectionState.Disconnected);
    await wrapper.vm.$nextTick();

    consumer = wrapper.find('#consumer'); // Re-find after update
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-is-reconnecting')).toBe('false');
    expect(consumer.attributes('data-is-disconnected')).toBe('true');
  });
});
