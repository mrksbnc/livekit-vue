import {
  useEnsureParticipant,
  useMaybeParticipantContext,
  useParticipantContext,
  useProvideParticipantContext,
} from '@/context/participant.context';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';

// Mock Participant
const mockParticipant = {
  identity: 'test-identity',
  name: 'Test User',
  metadata: '',
  isSpeaking: false,
  audioLevel: 0,
  connectionQuality: 0,
  permissions: {},
  isLocal: false,
  on: vi.fn(),
  off: vi.fn(),
  getTrack: vi.fn(),
  getTracks: vi.fn(() => []),
  getTrackPublication: vi.fn(),
};

describe('Participant Context', () => {
  // Create test components
  const ParticipantProvider = defineComponent({
    name: 'ParticipantProvider',
    props: ['participant'],
    setup(props) {
      useProvideParticipantContext(props.participant);
      return () => h('div', { id: 'provider' }, [h('slot')]);
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
      slots: { default: h(ParticipantConsumer) },
    });

    const consumer = wrapper.find('#consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-identity')).toBe('test-identity');
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
      slots: { default: h(MaybeParticipantConsumer) },
    });

    const consumer = wrapper.find('#maybe-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-has-context')).toBe('true');
    expect(consumer.text()).toBe('test-identity');
  });

  it('should throw error when using useParticipantContext outside provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => mount(ParticipantConsumer)).toThrow();

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

  it('should use provider participant with useEnsureParticipant when no local participant', () => {
    const wrapper = mount(ParticipantProvider, {
      props: { participant: mockParticipant },
      slots: { default: h(EnsureParticipantConsumer) },
    });

    const consumer = wrapper.find('#ensure-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-identity')).toBe('test-identity');
  });

  it('should use default participant with useEnsureParticipant when no context or local participant', () => {
    // Mount the consumer without a provider or local participant
    const wrapper = mount(EnsureParticipantConsumer);

    const consumer = wrapper.find('#ensure-consumer');
    expect(consumer.exists()).toBe(true);
    // The default participant should have an empty identity
    expect(consumer.attributes('data-identity')).toBe('');
  });
});
