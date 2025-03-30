import {
  useEnsureRoomContext,
  useMaybeRoomContext,
  useProvideRoomContext,
  useRoomContext,
} from '@/context/room.context';
import { mount } from '@vue/test-utils';
import { Room } from 'livekit-client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, type SetupContext } from 'vue';

describe('Room Context', () => {
  let currentMockRoom: Room;

  beforeEach(() => {
    currentMockRoom = new Room();
  });

  const RoomProvider = defineComponent({
    name: 'RoomProvider',
    props: ['room'],

    setup(props, { slots }: SetupContext) {
      useProvideRoomContext(props.room);
      return () => (slots.default ? slots.default() : null);
    },
  });

  const RoomConsumer = defineComponent({
    name: 'RoomConsumer',
    setup() {
      const room = useRoomContext();
      return () => {
        return h('div', { id: 'consumer', 'data-name': room.value?.name ?? '' });
      };
    },
  });

  const MaybeRoomConsumer = defineComponent({
    name: 'MaybeRoomConsumer',
    setup() {
      const room = useMaybeRoomContext();
      return () => {
        return h(
          'div',
          { id: 'maybe-consumer', 'data-has-context': !!room },
          room ? (room.value?.name ?? '') : 'no-context',
        );
      };
    },
  });

  const EnsureRoomConsumer = defineComponent({
    name: 'EnsureRoomConsumer',
    props: ['localRoom'],
    setup(props) {
      const room = useEnsureRoomContext(props.localRoom);
      return () => {
        return h('div', { id: 'ensure-consumer', 'data-name': room.value?.name ?? '' });
      };
    },
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide and consume room context', () => {
    const wrapper = mount(RoomProvider, {
      props: { room: currentMockRoom },

      slots: { default: '<RoomConsumer />' },
      global: {
        components: { RoomConsumer },
      },
    });

    const consumer = wrapper.find('#consumer');
    expect(consumer.exists()).toBe(true);
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
      props: { room: currentMockRoom },

      slots: { default: '<MaybeRoomConsumer />' },
      global: {
        components: { MaybeRoomConsumer },
      },
    });

    const consumer = wrapper.find('#maybe-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-has-context')).toBe('true');
  });

  it('should throw error when using useRoomContext outside provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => mount(RoomConsumer)).toThrow(
      'Please call `useProvideRoomContext` on the appropriate parent component',
    );

    errorSpy.mockRestore();
  });

  it('should use passed room with useEnsureRoomContext', () => {
    const localRoom = { ...currentMockRoom, name: 'local-room' };

    const wrapper = mount(EnsureRoomConsumer, {
      props: { localRoom },
    });

    const consumer = wrapper.find('#ensure-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-name')).toBe('local-room');
  });

  it('should use provider room with useEnsureRoomContext when no local room prop', () => {
    const wrapper = mount(RoomProvider, {
      props: { room: currentMockRoom },

      slots: { default: '<EnsureRoomConsumer />' },
      global: {
        components: { EnsureRoomConsumer },
      },
    });

    const consumer = wrapper.find('#ensure-consumer');
    expect(consumer.exists()).toBe(true);
  });

  it('should throw error when using useEnsureRoomContext with no context or local room prop', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => mount(EnsureRoomConsumer)).toThrow(
      'Please call `useProvideRoomContext` on the appropriate parent component',
    );

    errorSpy.mockRestore();
  });
});
