import { useMediaDevices } from '@/composables/useMediaDevices';
import { createMediaDeviceObserver } from '@livekit/components-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

// Mock dependencies
vi.mock('@livekit/components-core', () => ({
  createMediaDeviceObserver: vi.fn(),
}));

describe('useMediaDevices', () => {
  // Mock device list
  const mockDevices = [
    { deviceId: 'device1', kind: 'audioinput', label: 'Audio Input 1' },
    { deviceId: 'device2', kind: 'videoinput', label: 'Video Input 1' },
  ] as MediaDeviceInfo[];

  // Mock subscription
  const mockSubscribe = {
    unsubscribe: vi.fn(),
  };

  // Mock observer
  const mockObservable = {
    subscribe: vi.fn().mockReturnValue(mockSubscribe),
  };

  // Original implementation
  const originalMediaDevices = navigator.mediaDevices;
  const originalAudio = HTMLAudioElement.prototype;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock HTMLAudioElement.prototype.setSinkId
    Object.defineProperty(HTMLAudioElement.prototype, 'setSinkId', {
      value: vi.fn(),
      configurable: true,
    });

    // Mock navigator.mediaDevices
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        enumerateDevices: vi.fn().mockResolvedValue(mockDevices),
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
      configurable: true,
    });

    // Setup createMediaDeviceObserver mock
    vi.mocked(createMediaDeviceObserver).mockReturnValue(mockObservable);
  });

  afterEach(() => {
    // Restore original implementation
    Object.defineProperty(navigator, 'mediaDevices', {
      value: originalMediaDevices,
      configurable: true,
    });

    Object.defineProperty(HTMLAudioElement.prototype, 'setSinkId', {
      value: originalAudio.setSinkId,
      configurable: true,
    });
  });

  it('should initialize with empty devices list', () => {
    const { devices } = useMediaDevices({ kind: 'audioinput' });
    expect(devices.value).toEqual([]);
  });

  it('should set canSelectAudioOutput based on browser capability', () => {
    // Test when setSinkId is available
    let { canSelectAudioOutput } = useMediaDevices({ kind: 'audioinput' });
    expect(canSelectAudioOutput.value).toBe(true);

    // Test when setSinkId is not available
    delete HTMLAudioElement.prototype.setSinkId;
    ({ canSelectAudioOutput } = useMediaDevices({ kind: 'audioinput' }));
    expect(canSelectAudioOutput.value).toBe(false);
  });

  it('should create a media device observer with the correct parameters', () => {
    const onError = vi.fn();
    useMediaDevices({
      kind: 'videoinput',
      onError,
      requestPermissions: true,
    });

    expect(createMediaDeviceObserver).toHaveBeenCalledWith('videoinput', onError, true);
  });

  it('should update devices when observer emits', async () => {
    const { devices } = useMediaDevices({ kind: 'audioinput' });

    // Initially empty
    expect(devices.value).toEqual([]);

    // Simulate observer emitting new devices
    const subscribeCb = vi.mocked(mockObservable.subscribe).mock.calls[0][0];
    subscribeCb.next(mockDevices);

    // Check if devices were updated
    await nextTick();
    expect(devices.value).toEqual(mockDevices);
  });

  it('should add and remove device change event listener', async () => {
    useMediaDevices({ kind: 'audioinput' });

    expect(navigator.mediaDevices.addEventListener).toHaveBeenCalledWith(
      'devicechange',
      expect.any(Function),
    );

    // Extract the cleanup function from watchEffect
    const cleanupListener = vi.mocked(navigator.mediaDevices.addEventListener).mock.calls[0][1];

    // Call the cleanup function to simulate component unmounting
    const onCleanup = (fn: () => void) => fn();
    onCleanup(() => {
      navigator.mediaDevices.removeEventListener('devicechange', cleanupListener);
    });

    expect(navigator.mediaDevices.removeEventListener).toHaveBeenCalledWith(
      'devicechange',
      cleanupListener,
    );
  });

  it('should request permissions successfully', async () => {
    const { requestPermission } = useMediaDevices({ kind: 'audioinput' });

    const result = await requestPermission('audio');

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: true,
      video: false,
    });
    expect(result).toBe(true);
  });

  it('should handle permission request errors', async () => {
    const onError = vi.fn();
    const mediaError = new Error('Permission denied');

    // Mock getUserMedia to reject
    navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(mediaError);

    const { requestPermission } = useMediaDevices({
      kind: 'audioinput',
      onError,
    });

    const result = await requestPermission('audio');

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: true,
      video: false,
    });
    expect(result).toBe(false);
    expect(onError).toHaveBeenCalledWith(mediaError);
  });
});
