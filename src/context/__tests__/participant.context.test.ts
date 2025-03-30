import {
  useEnsureParticipant,
  useMaybeParticipantContext,
  useParticipantContext,
  useProvideParticipantContext,
} from '@/context/participant.context';
import { mount } from '@vue/test-utils';
import { Participant } from 'livekit-client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, type SetupContext } from 'vue';

const mockParticipant = vi.mocked(
  new Participant('test-identity', 'Test User', 'test-name', 'metadata', {}),
);

describe('Participant Context', () => {
  const ParticipantProvider = defineComponent({
    name: 'ParticipantProvider',
    props: ['participant'],

    setup(props, { slots }: SetupContext) {
      useProvideParticipantContext(props.participant);
      return () => (slots.default ? slots.default() : null);
    },
  });

  const ParticipantConsumer = defineComponent({
    name: 'ParticipantConsumer',
    setup() {
      const participant = useParticipantContext();
      return () => h('div', { id: 'consumer', 'data-identity': participant.value.identity });
    },
  });

  const MaybeParticipantConsumer = defineComponent({
    name: 'MaybeParticipantConsumer',
    setup() {
      const participant = useMaybeParticipantContext();
      return () =>
        h(
          'div',
          { id: 'maybe-consumer', 'data-has-context': !!participant },

          participant ? participant.value.identity : 'no-context',
        );
    },
  });

  const EnsureParticipantConsumer = defineComponent({
    name: 'EnsureParticipantConsumer',

    props: ['localParticipant'],
    setup(props) {
      const participant = useEnsureParticipant(props.localParticipant);

      return () => h('div', { id: 'ensure-consumer', 'data-identity': participant.value.identity });
    },
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide and consume participant context', () => {
    const wrapper = mount(ParticipantProvider, {
      props: { participant: mockParticipant },

      slots: { default: '<ParticipantConsumer />' },
      global: {
        components: { ParticipantConsumer },
      },
    });

    const consumer = wrapper.find('#consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-identity')).toBe('Test User');
  });

  it('should return undefined when using useMaybeParticipantContext outside provider', () => {
    const wrapper = mount(MaybeParticipantConsumer);

    const consumer = wrapper.find('#maybe-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-has-context')).toBe('false');
    expect(consumer.text()).toBe('no-context');
  });

  it('should return participant when using useMaybeParticipantContext inside provider', () => {
    const wrapper = mount(ParticipantProvider, {
      props: { participant: mockParticipant },

      slots: { default: '<MaybeParticipantConsumer />' },
      global: {
        components: { MaybeParticipantConsumer },
      },
    });

    const consumer = wrapper.find('#maybe-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-has-context')).toBe('true');
    expect(consumer.text()).toBe('Test User');
  });

  it('should throw error when using useParticipantContext outside provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => mount(ParticipantConsumer)).toThrow(
      'Please call `useProvideParticipantContext` on the appropriate parent component',
    );

    errorSpy.mockRestore();
  });

  it('should use passed participant with useEnsureParticipant', () => {
    const localParticipant = { ...mockParticipant, identity: 'local-identity' };

    const wrapper = mount(EnsureParticipantConsumer, {
      props: { localParticipant },
    });

    const consumer = wrapper.find('#ensure-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-identity')).toBe('local-identity');
  });

  it('should use provider participant with useEnsureParticipant when no local participant prop', () => {
    const wrapper = mount(ParticipantProvider, {
      props: { participant: mockParticipant },

      slots: { default: '<EnsureParticipantConsumer />' },
      global: {
        components: { EnsureParticipantConsumer },
      },
    });

    const consumer = wrapper.find('#ensure-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-identity')).toBe('Test User');
  });

  it('should throw error with useEnsureParticipant when no context or local participant prop', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => mount(EnsureParticipantConsumer)).toThrow(
      'Please call `useProvideParticipantContext` on the appropriate parent component',
    );
    errorSpy.mockRestore();
  });
});
