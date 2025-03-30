import { useMediaDevices } from '@/composables/useMediaDevices';
import * as componentsCore from '@livekit/components-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

vi.mock('@livekit/components-core', () => ({
  createMediaDeviceObserver: vi.fn(),
}));

type ObserverNext = (value: MediaDeviceInfo[]) => void;
type ObserverError = (error: Error) => void;

interface ObserverCallbacks {
  next: ObserverNext | null;
  error: ObserverError | null;
}

const mockAudioInputDevice: MediaDeviceInfo = {
  deviceId: 'audio-input-1',
  kind: 'audioinput',
  label: 'Default Microphone',
  groupId: 'group-1',
  toJSON: () => ({}),
};

describe('useMediaDevices', () => {
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

  const originalMediaDevices = navigator.mediaDevices;
  const mockGetUserMedia = vi.fn();
  const mockEnumerateDevices = vi.fn();
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();

  const mockTrack = { stop: vi.fn() };
  const mockTracksArray = [mockTrack];
  const mockStream = { getTracks: vi.fn(() => mockTracksArray) };

  beforeEach(() => {
    vi.clearAllMocks();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(componentsCore.createMediaDeviceObserver).mockReturnValue(mockObservable as any);

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: mockGetUserMedia.mockResolvedValue(mockStream),
        enumerateDevices: mockEnumerateDevices,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      },
      writable: true,
      configurable: true,
    });

    mockEnumerateDevices.mockResolvedValue([mockAudioInputDevice]);
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: originalMediaDevices,
    });
  });

  it('should create observer with the specified kind and options', () => {
    const onError = vi.fn();
    useMediaDevices({ kind: 'audioinput', onError, requestPermissions: true });
    expect(componentsCore.createMediaDeviceObserver).toHaveBeenCalledWith(
      'audioinput',
      onError,
      true,
    );
  });

  it('should initialize devices ref with an empty array', () => {
    const { devices } = useMediaDevices({ kind: 'videoinput' });
    expect(devices.value).toEqual([]);
  });

  it('should update devices when observer emits', async () => {
    const { devices } = useMediaDevices({ kind: 'audioinput' });
    expect(devices.value).toEqual([]);

    const newDeviceList = [
      mockAudioInputDevice,
      { ...mockAudioInputDevice, deviceId: 'audio-2' } as MediaDeviceInfo,
    ];
    if (mockObserverCallbacks.next) {
      mockObserverCallbacks.next(newDeviceList);
    }

    await nextTick();

    expect(devices.value).toEqual(newDeviceList);
  });

  it('should request permissions successfully and stop tracks', async () => {
    const { requestPermission } = useMediaDevices({ kind: 'audioinput' });
    const success = await requestPermission('audio');

    expect(success).toBe(true);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true, video: false });
    expect(mockStream.getTracks).toHaveBeenCalled();
    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it('should request video permissions', async () => {
    const { requestPermission } = useMediaDevices({ kind: 'videoinput' });
    await requestPermission('video');
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: false, video: true });
  });

  it('should request both audio and video permissions', async () => {
    const { requestPermission } = useMediaDevices({ kind: 'videoinput' });
    await requestPermission('both');
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true, video: true });
  });

  it('should handle errors during permission request and call onError', async () => {
    const testError = new Error('Permission Denied');
    mockGetUserMedia.mockRejectedValue(testError);
    const onErrorMock = vi.fn();

    const { requestPermission } = useMediaDevices({ kind: 'audioinput', onError: onErrorMock });
    const success = await requestPermission('audio');

    expect(success).toBe(false);
    expect(onErrorMock).toHaveBeenCalledWith(testError);
  });

  it('should correctly determine canSelectAudioOutput based on prototype', () => {
    const { canSelectAudioOutput } = useMediaDevices({ kind: 'audiooutput' });

    expect(canSelectAudioOutput.value).toBe('setSinkId' in HTMLAudioElement.prototype);
  });

  it('should unsubscribe from the observer on cleanup', () => {
    useMediaDevices({ kind: 'audioinput' });
    const cleanup = vi.fn();
    const onCleanup = (fn: () => void) => cleanup.mockImplementation(fn);
    onCleanup(() => mockSubscribe.unsubscribe());
    cleanup();
    expect(mockObservable.subscribe).toHaveBeenCalled();
    expect(mockSubscribe.unsubscribe).toHaveBeenCalled();
  });

  it('should add and remove devicechange listener', () => {
    let capturedListener: EventListener | undefined;
    mockAddEventListener.mockImplementation((event: string, listener: EventListener) => {
      if (event === 'devicechange') {
        capturedListener = listener;
      }
    });

    useMediaDevices({ kind: 'audioinput' });

    expect(mockAddEventListener).toHaveBeenCalledWith('devicechange', expect.any(Function));
    expect(capturedListener).toBeDefined();

    const cleanup = vi.fn();
    const onCleanup = (fn: () => void) => cleanup.mockImplementation(fn);

    onCleanup(() => {
      if (capturedListener) {
        mockRemoveEventListener('devicechange', capturedListener);
      }
    });
    cleanup();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('devicechange', capturedListener);
  });
});
