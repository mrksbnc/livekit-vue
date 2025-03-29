import { useIsSpeaking } from '@/composables/useIsSpeaking';
import * as participantContext from '@/context/participant.context';
import { createIsSpeakingObserver } from '@livekit/components-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

// Mock dependencies
vi.mock('@livekit/components-core', () => ({
  createIsSpeakingObserver: vi.fn(),
}));

vi.mock('@/context/participant.context', () => ({
  useEnsureParticipant: vi.fn(),
}));

describe('useIsSpeaking', () => {
  const mockParticipant = {
    isSpeaking: false,
    on: vi.fn(),
    off: vi.fn(),
  };

  const mockSubscribe = {
    unsubscribe: vi.fn(),
  };

  const mockObservable = {
    subscribe: vi.fn().mockReturnValue(mockSubscribe),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(participantContext, 'useEnsureParticipant').mockReturnValue(ref(mockParticipant));
    vi.mocked(createIsSpeakingObserver).mockReturnValue(mockObservable);
  });

  it('should initialize with the participant speaking state', () => {
    // Set initial speaking state
    mockParticipant.isSpeaking = true;

    const { isSpeaking } = useIsSpeaking({ participant: mockParticipant });

    expect(isSpeaking.value).toBe(true);
    expect(participantContext.useEnsureParticipant).toHaveBeenCalledWith(mockParticipant);
  });

  it('should update speaking state when the speaking observer emits', async () => {
    const { isSpeaking } = useIsSpeaking({ participant: mockParticipant });

    expect(isSpeaking.value).toBe(false);

    // Simulate speaking observer emitting a speaking state change
    const subscribeCb = vi.mocked(mockObservable.subscribe).mock.calls[0][0];
    subscribeCb.next(true);

    await nextTick();
    expect(isSpeaking.value).toBe(true);
  });

  it('should handle errors from the speaking observer', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    useIsSpeaking({ participant: mockParticipant });

    // Simulate error in the speaking observer
    const subscribeCb = vi.mocked(mockObservable.subscribe).mock.calls[0][0];
    subscribeCb.error(new Error('Test error'));

    await nextTick();
    expect(consoleSpy).toHaveBeenCalledWith('Speaking state observer error:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should unsubscribe from the observer on cleanup', async () => {
    useIsSpeaking({ participant: mockParticipant });

    // Extract the cleanup function
    const cleanupFn = vi.mocked(mockObservable.subscribe).mock.calls[0][0];

    // Call the cleanup function
    const onCleanup = vi.fn();
    cleanupFn.error(new Error('Test error'));

    // Test the unsubscribe logic
    expect(mockSubscribe.unsubscribe).not.toHaveBeenCalled();

    // Trigger the cleanup
    onCleanup.mockImplementation((fn) => fn());

    await nextTick();
    expect(mockSubscribe.unsubscribe).toHaveBeenCalled();
  });
});
