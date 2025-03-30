import { useIsSpeaking } from '@/composables/useIsSpeaking';
import * as participantContext from '@/context/participant.context';
import * as componentsCore from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, shallowRef } from 'vue';

vi.mock('@livekit/components-core', () => ({
  createIsSpeakingObserver: vi.fn(),
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

describe('useIsSpeaking', () => {
  const mockParticipant = {} as unknown as Participant;

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

    Object.defineProperty(mockParticipant, 'isSpeaking', {
      value: false,
      writable: true,
      configurable: true,
    });

    vi.spyOn(participantContext, 'useEnsureParticipant').mockReturnValue(
      shallowRef(mockParticipant),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(componentsCore.createIsSpeakingObserver).mockReturnValue(mockObservable as any);
  });

  it('should initialize with participant.isSpeaking value', () => {
    Object.defineProperty(mockParticipant, 'isSpeaking', { value: true });
    const { isSpeaking } = useIsSpeaking({ participant: mockParticipant });
    expect(isSpeaking.value).toBe(true);
  });

  it('should initialize as false if participant.isSpeaking is initially false', () => {
    Object.defineProperty(mockParticipant, 'isSpeaking', { value: false });
    const { isSpeaking } = useIsSpeaking({ participant: mockParticipant });
    expect(isSpeaking.value).toBe(false);
  });

  it('should create speaking observer with the ensured participant', () => {
    const ensuredParticipant = { ...mockParticipant, sid: 'ensured-p' } as Participant;
    vi.spyOn(participantContext, 'useEnsureParticipant').mockReturnValue(
      shallowRef(ensuredParticipant),
    );

    useIsSpeaking({ participant: mockParticipant });

    expect(participantContext.useEnsureParticipant).toHaveBeenCalledWith(mockParticipant);
    expect(componentsCore.createIsSpeakingObserver).toHaveBeenCalledWith(ensuredParticipant);
  });

  it('should update isSpeaking when observable emits', async () => {
    const { isSpeaking } = useIsSpeaking({ participant: mockParticipant });

    expect(isSpeaking.value).toBe(false);

    if (mockObserverCallbacks.next) {
      mockObserverCallbacks.next(true);
    }
    await nextTick();
    expect(isSpeaking.value).toBe(true);

    if (mockObserverCallbacks.next) {
      mockObserverCallbacks.next(false);
    }
    await nextTick();
    expect(isSpeaking.value).toBe(false);
  });

  it('should handle errors from the observable', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    useIsSpeaking({ participant: mockParticipant });

    if (mockObserverCallbacks.error) {
      mockObserverCallbacks.error(new Error('Speaking observer test error'));
    }
    await nextTick();

    expect(consoleSpy).toHaveBeenCalledWith('Speaking state observer error:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should unsubscribe from the observable on cleanup', () => {
    useIsSpeaking({ participant: mockParticipant });

    const cleanup = vi.fn();
    const onCleanup = (fn: () => void) => cleanup.mockImplementation(fn);
    onCleanup(() => mockSubscribe.unsubscribe());
    cleanup();

    expect(mockSubscribe.unsubscribe).toHaveBeenCalled();
  });
});
