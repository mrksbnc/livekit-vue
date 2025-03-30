import { useIsMuted } from '@/composables/useIsMuted';
import * as participantContext from '@/context/participant.context';
import type { TrackReference, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import * as componentsCore from '@livekit/components-core';
import { Participant, Track, TrackPublication } from 'livekit-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, shallowRef } from 'vue';

vi.mock('@livekit/components-core', () => ({
  mutedObserver: vi.fn(),
}));

vi.mock('@/context/participant.context', () => ({
  useEnsureParticipant: vi.fn(),
}));

type ObserverNext = (value: boolean) => void;
type ObserverError = (error: Error) => void;

interface ObserverCallbacks {
  next: ObserverNext | null;
  error: ObserverError | null;
}

describe('useIsMuted', () => {
  const mockParticipant = {
    getTrackPublication: vi.fn(),
  } as unknown as Participant;

  const mockPublication = {
    trackSid: 'track-sid-123',
  } as unknown as TrackPublication;

  const mockSubscribe = {
    unsubscribe: vi.fn(),
  };

  const mockObserverCallbacks: ObserverCallbacks = {
    next: null,
    error: null,
  };

  const mockObservable = {
    subscribe: vi.fn((observer: { next: ObserverNext; error: ObserverError }) => {
      mockObserverCallbacks.next = observer.next;
      mockObserverCallbacks.error = observer.error;
      return mockSubscribe;
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(mockPublication, 'isMuted', {
      value: false,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockParticipant, 'isLocal', {
      value: false,
      writable: true,
      configurable: true,
    });
    mockParticipant.getTrackPublication = vi.fn().mockReturnValue(mockPublication);

    vi.spyOn(participantContext, 'useEnsureParticipant').mockReturnValue(
      shallowRef(mockParticipant),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(componentsCore.mutedObserver).mockReturnValue(mockObservable as any);
  });

  it('should initialize with muted state from TrackReference publication', () => {
    Object.defineProperty(mockPublication, 'isMuted', { value: true, writable: true });
    const trackRef: TrackReference = {
      participant: mockParticipant,
      source: Track.Source.Camera,
      publication: mockPublication,
    };

    const { isMuted } = useIsMuted({ sourceOrTrackRef: trackRef });

    expect(isMuted.value).toBe(true);
  });

  it('should initialize with muted state from participant getTrackPublication if publication missing', () => {
    Object.defineProperty(mockPublication, 'isMuted', { value: true, writable: true });
    mockParticipant.getTrackPublication = vi.fn().mockReturnValue(mockPublication);
    const trackRef: TrackReferenceOrPlaceholder = {
      participant: mockParticipant,
      source: Track.Source.Microphone,
    };

    const { isMuted } = useIsMuted({ sourceOrTrackRef: trackRef });

    expect(isMuted.value).toBe(true);
    expect(mockParticipant.getTrackPublication).toHaveBeenCalledWith(Track.Source.Microphone);
  });

  it('should initialize as false if publication and track not found', () => {
    mockParticipant.getTrackPublication = vi.fn().mockReturnValue(undefined);
    const trackRef: TrackReferenceOrPlaceholder = {
      participant: mockParticipant,
      source: Track.Source.ScreenShare,
    };

    const { isMuted } = useIsMuted({ sourceOrTrackRef: trackRef });

    expect(isMuted.value).toBe(false);
    expect(mockParticipant.getTrackPublication).toHaveBeenCalledWith(Track.Source.ScreenShare);
  });

  it('should handle Track.Source as input', () => {
    Object.defineProperty(mockPublication, 'isMuted', { value: true, writable: true });
    const { isMuted } = useIsMuted({
      participant: mockParticipant,
      sourceOrTrackRef: Track.Source.Camera,
    });

    expect(isMuted.value).toBe(true);
    expect(participantContext.useEnsureParticipant).toHaveBeenCalledWith(mockParticipant);

    expect(componentsCore.mutedObserver).toHaveBeenCalledWith(
      expect.objectContaining({
        participant: mockParticipant,
        source: Track.Source.Camera,
      }),
    );
  });

  it('should use participant from context if not provided in props (with Track.Source)', () => {
    const contextParticipant = { ...mockParticipant, sid: 'context-p' } as Participant;
    vi.spyOn(participantContext, 'useEnsureParticipant').mockReturnValue(
      shallowRef(contextParticipant),
    );

    useIsMuted({ sourceOrTrackRef: Track.Source.Microphone });

    expect(participantContext.useEnsureParticipant).toHaveBeenCalledWith(undefined);
    expect(componentsCore.mutedObserver).toHaveBeenCalledWith(
      expect.objectContaining({
        participant: contextParticipant,
        source: Track.Source.Microphone,
      }),
    );
  });

  it('should use participant from TrackReference if provided (ignoring context and prop participant)', () => {
    const trackRefParticipant = { ...mockParticipant, sid: 'trackref-p' } as Participant;
    const propParticipant = { ...mockParticipant, sid: 'prop-p' } as Participant;
    const trackRef: TrackReference = {
      participant: trackRefParticipant,
      source: Track.Source.Camera,
      publication: mockPublication,
    };

    vi.spyOn(participantContext, 'useEnsureParticipant').mockReturnValue(
      shallowRef(trackRefParticipant),
    );

    useIsMuted({ participant: propParticipant, sourceOrTrackRef: trackRef });

    expect(participantContext.useEnsureParticipant).toHaveBeenCalledWith(trackRefParticipant);

    expect(componentsCore.mutedObserver).toHaveBeenCalledWith(trackRef);
  });

  it('should update muted state when observable emits', async () => {
    const trackRef: TrackReference = {
      participant: mockParticipant,
      source: Track.Source.Camera,
      publication: mockPublication,
    };
    const { isMuted } = useIsMuted({ sourceOrTrackRef: trackRef });

    expect(isMuted.value).toBe(false);

    if (mockObserverCallbacks.next) {
      mockObserverCallbacks.next(true);
    }

    await nextTick();
    expect(isMuted.value).toBe(true);
  });

  it('should handle errors from the observable', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const trackRef: TrackReference = {
      participant: mockParticipant,
      source: Track.Source.Camera,
      publication: mockPublication,
    };
    useIsMuted({ sourceOrTrackRef: trackRef });

    if (mockObserverCallbacks.error) {
      mockObserverCallbacks.error(new Error('Observer test error'));
    }

    await nextTick();

    expect(consoleSpy).toHaveBeenCalledWith('Muted state observer error:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should unsubscribe from the observable on cleanup', () => {
    const trackRef: TrackReference = {
      participant: mockParticipant,
      source: Track.Source.Camera,
      publication: mockPublication,
    };
    useIsMuted({ sourceOrTrackRef: trackRef });

    const cleanup = vi.fn();
    const onCleanup = (fn: () => void) => cleanup.mockImplementation(fn);
    onCleanup(() => mockSubscribe.unsubscribe());
    cleanup();

    expect(mockSubscribe.unsubscribe).toHaveBeenCalled();
  });
});
