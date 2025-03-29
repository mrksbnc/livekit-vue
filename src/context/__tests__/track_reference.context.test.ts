import {
  useEnsureTrackRef,
  useMaybeTrackRefContext,
  useProvideTrackRefContext,
  useTrackRefContext,
} from '@/context/track_reference.context';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';

// Mock TrackReference
const mockTrackRef = {
  publication: {
    trackName: 'test-track',
    kind: 'video',
    source: 'camera',
    track: { sid: 'track-1' },
  },
  participant: {
    identity: 'test-identity',
    name: 'Test User',
  },
  source: 'camera',
};

describe('Track Reference Context', () => {
  // Create test components
  const TrackRefProvider = defineComponent({
    name: 'TrackRefProvider',
    props: ['trackRef'],
    setup(props) {
      useProvideTrackRefContext(props.trackRef);
      return () => h('div', { id: 'provider' }, [h('slot')]);
    },
  });

  const TrackRefConsumer = defineComponent({
    name: 'TrackRefConsumer',
    setup() {
      const trackRef = useTrackRefContext();
      return () => h('div', { id: 'consumer', 'data-source': trackRef.value.source });
    },
  });

  const MaybeTrackRefConsumer = defineComponent({
    name: 'MaybeTrackRefConsumer',
    setup() {
      const trackRef = useMaybeTrackRefContext();
      return () =>
        h(
          'div',
          { id: 'maybe-consumer', 'data-has-context': !!trackRef },
          trackRef ? trackRef.value.source : 'no-context',
        );
    },
  });

  const EnsureTrackRefConsumer = defineComponent({
    name: 'EnsureTrackRefConsumer',
    props: ['localTrackRef'],
    setup(props) {
      const trackRef = useEnsureTrackRef(props.localTrackRef);
      return () => h('div', { id: 'ensure-consumer', 'data-source': trackRef.value.source });
    },
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide and consume track reference context', () => {
    const wrapper = mount(TrackRefProvider, {
      props: { trackRef: mockTrackRef },
      slots: { default: h(TrackRefConsumer) },
    });

    const consumer = wrapper.find('#consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-source')).toBe('camera');
  });

  it('should return undefined when using useMaybeTrackRefContext outside provider', () => {
    const wrapper = mount(MaybeTrackRefConsumer);

    const consumer = wrapper.find('#maybe-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-has-context')).toBe('false');
    expect(consumer.text()).toBe('no-context');
  });

  it('should return track reference when using useMaybeTrackRefContext inside provider', () => {
    const wrapper = mount(TrackRefProvider, {
      props: { trackRef: mockTrackRef },
      slots: { default: h(MaybeTrackRefConsumer) },
    });

    const consumer = wrapper.find('#maybe-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-has-context')).toBe('true');
    expect(consumer.text()).toBe('camera');
  });

  it('should throw error when using useTrackRefContext outside provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => mount(TrackRefConsumer)).toThrow();

    errorSpy.mockRestore();
  });

  it('should use passed track reference with useEnsureTrackRef', () => {
    const localTrackRef = { ...mockTrackRef, source: 'microphone' };

    const wrapper = mount(EnsureTrackRefConsumer, {
      props: { localTrackRef },
    });

    const consumer = wrapper.find('#ensure-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-source')).toBe('microphone');
  });

  it('should use provider track reference with useEnsureTrackRef when no local track reference', () => {
    const wrapper = mount(TrackRefProvider, {
      props: { trackRef: mockTrackRef },
      slots: { default: h(EnsureTrackRefConsumer) },
    });

    const consumer = wrapper.find('#ensure-consumer');
    expect(consumer.exists()).toBe(true);
    expect(consumer.attributes('data-source')).toBe('camera');
  });

  it('should throw when using useEnsureTrackRef with no context or local track reference', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Should throw since there's no context or local track reference
    expect(() => mount(EnsureTrackRefConsumer)).toThrow();

    errorSpy.mockRestore();
  });
});
