import { useLocalParticipant } from '@/composables/useLocalParticipant';
import * as roomContext from '@/context/room.context';
import type { ParticipantMedia } from '@livekit/components-core';
import * as componentsCore from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { LocalParticipant, TrackPublication } from 'livekit-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, shallowRef } from 'vue';

vi.mock('@livekit/components-core', () => ({
  observeParticipantMedia: vi.fn(),
}));

vi.mock('@/context/room.context', () => ({
  useEnsureRoomContext: vi.fn(),
}));

type ObserverNext = (value: ParticipantMedia<LocalParticipant>) => void;
type ObserverError = (error: Error) => void;

interface ObserverCallbacks {
  next: ObserverNext | null;
  error: ObserverError | null;
}

describe('useLocalParticipant', () => {
  const mockLocalParticipant = {
    isMicrophoneEnabled: false,
    isCameraEnabled: false,
    isScreenShareEnabled: false,
    lastMicrophoneError: undefined as Error | undefined,
    lastCameraError: undefined as Error | undefined,
  } as unknown as LocalParticipant;

  const mockRoom = {
    localParticipant: mockLocalParticipant,
  } as unknown as Room;

  const mockMicPub = { trackSid: 'mic-sid' } as TrackPublication;
  const mockCamPub = { trackSid: 'cam-sid' } as TrackPublication;

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

    Object.defineProperty(mockLocalParticipant, 'isMicrophoneEnabled', {
      value: false,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockLocalParticipant, 'isCameraEnabled', {
      value: false,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockLocalParticipant, 'isScreenShareEnabled', {
      value: false,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockLocalParticipant, 'lastMicrophoneError', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockLocalParticipant, 'lastCameraError', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    mockRoom.localParticipant = mockLocalParticipant;

    // Setup default mocks
    // Ensure the room mock allows undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(roomContext, 'useEnsureRoomContext').mockReturnValue(shallowRef(mockRoom) as any);
    // Use 'as any' for observable mock due to rxjs version issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(componentsCore.observeParticipantMedia).mockReturnValue(mockObservable as any);
  });

  it('should initialize with local participant state from room context', () => {
    Object.defineProperty(mockLocalParticipant, 'isMicrophoneEnabled', { value: true });
    Object.defineProperty(mockLocalParticipant, 'isCameraEnabled', { value: true });
    const testError = new Error('TestCamError');
    Object.defineProperty(mockLocalParticipant, 'lastCameraError', { value: testError });

    const result = useLocalParticipant();

    expect(result.localParticipant.value).toBe(mockLocalParticipant);
    expect(result.isMicrophoneEnabled.value).toBe(true);
    expect(result.isCameraEnabled.value).toBe(true);
    expect(result.isScreenShareEnabled.value).toBe(false);
    expect(result.lastMicrophoneError.value).toBeUndefined();
    expect(result.lastCameraError.value).toBe(testError);
    expect(result.microphoneTrack.value).toBeUndefined();
    expect(result.cameraTrack.value).toBeUndefined();
  });

  it('should initialize with default false/undefined values if no local participant exists initially', () => {
    // Mock room context to return a room with undefined localParticipant
    const roomWithNoLocal = { localParticipant: undefined } as unknown as Room;

    vi.spyOn(roomContext, 'useEnsureRoomContext').mockReturnValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shallowRef(roomWithNoLocal) as any,
    );

    const result = useLocalParticipant();

    expect(result.localParticipant.value).toBeUndefined();
    expect(result.isMicrophoneEnabled.value).toBe(false);
    expect(result.isCameraEnabled.value).toBe(false);
    expect(result.isScreenShareEnabled.value).toBe(false);
    expect(result.lastMicrophoneError.value).toBeUndefined();
    expect(result.lastCameraError.value).toBeUndefined();
    expect(result.microphoneTrack.value).toBeUndefined();
    expect(result.cameraTrack.value).toBeUndefined();
  });

  it('should create observer with the local participant', () => {
    useLocalParticipant();
    expect(componentsCore.observeParticipantMedia).toHaveBeenCalledWith(mockLocalParticipant);
  });

  it('should not create observer if local participant is initially undefined', () => {
    // Mock room context to return a room with undefined localParticipant
    const roomWithNoLocal = { localParticipant: undefined } as unknown as Room;

    vi.spyOn(roomContext, 'useEnsureRoomContext').mockReturnValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shallowRef(roomWithNoLocal) as any,
    );

    useLocalParticipant();
    expect(componentsCore.observeParticipantMedia).not.toHaveBeenCalled();
  });

  it('should update state when observer emits', async () => {
    const result = useLocalParticipant();

    const updatedState: ParticipantMedia<LocalParticipant> = {
      isCameraEnabled: true,
      isMicrophoneEnabled: true,
      isScreenShareEnabled: true,
      cameraTrack: mockCamPub,
      microphoneTrack: mockMicPub,
      participant: {
        ...mockLocalParticipant,
        lastCameraError: new Error('UpdatedError'),
      } as LocalParticipant,
    };

    if (mockObserverCallbacks.next) {
      mockObserverCallbacks.next(updatedState);
    }
    await nextTick();

    expect(result.isMicrophoneEnabled.value).toBe(true);
    expect(result.isCameraEnabled.value).toBe(true);
    expect(result.isScreenShareEnabled.value).toBe(true);
    expect(result.microphoneTrack.value).toBe(mockMicPub);
    expect(result.cameraTrack.value).toBe(mockCamPub);
    expect(result.lastCameraError.value).toEqual(new Error('UpdatedError'));
    expect(result.localParticipant.value).toEqual(updatedState.participant);
  });

  it('should handle errors from the observable', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    useLocalParticipant();

    if (mockObserverCallbacks.error) {
      mockObserverCallbacks.error(new Error('Observer test error'));
    }
    await nextTick();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error in participant media observable:',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it('should accept a custom room in props', () => {
    const customParticipant = { ...mockLocalParticipant, sid: 'custom-p' } as LocalParticipant;
    const customRoom = { localParticipant: customParticipant } as unknown as Room;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(roomContext, 'useEnsureRoomContext').mockReturnValue(shallowRef(customRoom) as any);

    useLocalParticipant({ room: customRoom });

    expect(roomContext.useEnsureRoomContext).toHaveBeenCalledWith(customRoom);
    expect(componentsCore.observeParticipantMedia).toHaveBeenCalledWith(customParticipant);
  });

  it('should unsubscribe from the observable on cleanup', () => {
    useLocalParticipant();

    const cleanup = vi.fn();
    const onCleanup = (fn: () => void) => cleanup.mockImplementation(fn);
    onCleanup(() => mockSubscribe.unsubscribe());
    cleanup();

    expect(mockObservable.subscribe).toHaveBeenCalled();
    expect(mockSubscribe.unsubscribe).toHaveBeenCalled();
  });
});
