import {
  useEnsureRoomContext,
  useMaybeRoomContext,
  useProvideRoomContext,
  useRoomContext,
} from '@/context/room.context';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';

// Mock Room
const mockRoom = {
  name: 'test-room',
  state: 'connected',
  connect: vi.fn(),
  disconnect: vi.fn(),
  localParticipant: { identity: 'local-user' },
  participants: new Map(),
  on: vi.fn(),
  off: vi.fn(),
};

describe('Room Context', () => {
  // Create test components
  const RoomProvider = defineComponent({
    name: 'RoomProvider',
    props: ['room'],
    setup(props) {
      useProvideRoomContext(props.room);
      return () => h('div', { id: 'provider' }, [h('slot')]);
    },
  });

  const RoomConsumer = defineComponent({
    name: 'RoomConsumer',
    setup() {
      const room = useRoomContext();
      return () => h('div', { id: 'consumer', 'data-name': room.value.name });
    },
  });

  const MaybeRoomConsumer = defineComponent({
    name: 'MaybeRoomConsumer',
    setup() {
      const room = useMaybeRoomContext();
      return () =>
        h(
          'div',
          { id: 'maybe-consumer', 'data-has-context': !!room },
          room ? room.value.name : 'no-context',
        );
    },
  });

  const EnsureRoomConsumer = defineComponent({
    name: 'EnsureRoomConsumer',
    props: ['localRoom'],
    setup(props) {
      const room = useEnsureRoomContext(props.localRoom);
      return () => h('div', { id: 'ensure-consumer', 'data-name': room.value.name });
    },
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide and consume room context', () => {
    const wrapper = mount(RoomProvider, {
      props: { room: mockRoom },
      slots: { default: h(RoomConsumer) },
    });

    const consumer = wrapper.find('#consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-name')).toBe('test-room');
  });

  it('should return undefined when using useMaybeRoomContext outside provider', () => {
    const wrapper = mount(MaybeRoomConsumer);

    const consumer = wrapper.find('#maybe-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-has-context')).toBe('false');
    expect(consumer.text()).toBe('no-context');
  });

  it('should return room when using useMaybeRoomContext inside provider', () => {
    const wrapper = mount(RoomProvider, {
      props: { room: mockRoom },
      slots: { default: h(MaybeRoomConsumer) },
    });

    const consumer = wrapper.find('#maybe-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-has-context')).toBe('true');
    expect(consumer.text()).toBe('test-room');
  });

  it('should throw error when using useRoomContext outside provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => mount(RoomConsumer)).toThrow();

    errorSpy.mockRestore();
  });

  it('should use passed room with useEnsureRoomContext', () => {
    const localRoom = { ...mockRoom, name: 'local-room' };

    const wrapper = mount(EnsureRoomConsumer, {
      props: { localRoom },
    });

    const consumer = wrapper.find('#ensure-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-name')).toBe('local-room');
  });

  it('should use provider room with useEnsureRoomContext when no local room', () => {
    const wrapper = mount(RoomProvider, {
      props: { room: mockRoom },
      slots: { default: h(EnsureRoomConsumer) },
    });

    const consumer = wrapper.find('#ensure-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-name')).toBe('test-room');
  });

  it('should throw when using useEnsureRoomContext with no context or local room', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Should throw since there's no context or local room
    expect(() => mount(EnsureRoomConsumer)).toThrow();

    errorSpy.mockRestore();
  });
});
