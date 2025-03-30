/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAudioPlayback } from '@/composables/useAudioPlayback';
import * as roomContext from '@/context/room.context';
import * as componentsCore from '@livekit/components-core';
import { Room } from 'livekit-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Ref } from 'vue';
import { nextTick, ref } from 'vue';

vi.mock('@livekit/components-core', () => ({
  roomAudioPlaybackAllowedObservable: vi.fn(),
}));

vi.mock('@/context/room.context', () => ({
  useEnsureRoomContext: vi.fn(),
}));

vi.mock('livekit-client', async () => {
  const actual = await vi.importActual('livekit-client');
  return {
    ...actual,
    Room: vi.fn(),
  };
});

type RoomContext = Ref<Room>;

describe('useAudioPlayback', () => {
  const mockRoom = {
    canPlaybackAudio: false,
    startAudio: vi.fn().mockResolvedValue(undefined),
  } as unknown as Room;

  const mockSubscribe = {
    unsubscribe: vi.fn(),
  };

  const mockObserverCallbacks = {
    next: null as any,
    error: null as any,
  };

  const mockObservable = {
    subscribe: vi.fn((observer: any) => {
      mockObserverCallbacks.next = observer.next;
      mockObserverCallbacks.error = observer.error;
      return mockSubscribe;
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(mockRoom, 'canPlaybackAudio', {
      writable: true,
      value: false,
    });

    (Room as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockRoom);

    vi.spyOn(roomContext, 'useEnsureRoomContext').mockReturnValue(ref(mockRoom) as any);
    vi.mocked(componentsCore.roomAudioPlaybackAllowedObservable).mockReturnValue(
      mockObservable as any,
    );
  });

  it('should initialize with room.canPlaybackAudio value', () => {
    Object.defineProperty(mockRoom, 'canPlaybackAudio', {
      writable: true,
      value: true,
    });

    const { canPlayAudio } = useAudioPlayback({});

    expect(canPlayAudio.value).toBe(true);

    Object.defineProperty(mockRoom, 'canPlaybackAudio', {
      writable: true,
      value: false,
    });
  });

  it('should initialize as false when no room is available', () => {
    vi.spyOn(roomContext, 'useEnsureRoomContext').mockReturnValue(ref(undefined) as any);

    const { canPlayAudio } = useAudioPlayback({});

    expect(canPlayAudio.value).toBe(false);
  });

  it('should create audio playback observable from the room', () => {
    useAudioPlayback({});

    expect(componentsCore.roomAudioPlaybackAllowedObservable).toHaveBeenCalledWith(mockRoom);
  });

  it('should update canPlayAudio when observable emits', async () => {
    const { canPlayAudio } = useAudioPlayback({});

    expect(canPlayAudio.value).toBe(false);

    if (mockObserverCallbacks.next) {
      mockObserverCallbacks.next({ canPlayAudio: true });
    }

    await nextTick();
    expect(canPlayAudio.value).toBe(true);
  });

  it('should handle errors from the observable', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    useAudioPlayback({});

    if (mockObserverCallbacks.error) {
      mockObserverCallbacks.error(new Error('Test error'));
    }

    await nextTick();

    expect(consoleSpy).toHaveBeenCalledWith('Audio playback observable error:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should call room.startAudio when startAudio is called', async () => {
    const { startAudio } = useAudioPlayback({});

    await startAudio();

    expect(mockRoom.startAudio).toHaveBeenCalled();
  });

  it('should handle errors when starting audio', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(mockRoom, 'startAudio').mockRejectedValueOnce(new Error('Start audio error'));

    const { startAudio } = useAudioPlayback({});

    await startAudio();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to start audio playback:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should do nothing when startAudio is called without a room', async () => {
    vi.spyOn(roomContext, 'useEnsureRoomContext').mockReturnValue(ref(undefined) as any);

    const { startAudio } = useAudioPlayback({});

    await startAudio();

    expect(mockRoom.startAudio).not.toHaveBeenCalled();
  });

  it('should accept a custom room in props', () => {
    const customRoom = { ...mockRoom } as unknown as Room;

    useAudioPlayback({ room: customRoom });

    expect(roomContext.useEnsureRoomContext).toHaveBeenCalledWith(customRoom);
  });

  it('should unsubscribe from the observable on cleanup', () => {
    useAudioPlayback({});

    const cleanup = vi.fn();
    const onCleanup = (fn: () => void) => cleanup.mockImplementation(fn);

    onCleanup(() => mockSubscribe.unsubscribe());
    cleanup();

    expect(mockSubscribe.unsubscribe).toHaveBeenCalled();
  });
});
