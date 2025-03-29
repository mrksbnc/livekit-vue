import { createMediaDeviceObserver } from '@livekit/components-core';
import { ref, shallowRef, watchEffect, type Ref } from 'vue';

export type UseMediaDevicesOptions = {
  kind: MediaDeviceKind;
  onError?: (e: Error) => void;
  requestPermissions?: boolean;
};

export type UseMediaDevices = {
  devices: Ref<MediaDeviceInfo[]>;
  canSelectAudioOutput: Ref<boolean>;
  requestPermission: (kind: 'audio' | 'video' | 'both') => Promise<boolean>;
};

export function useMediaDevices(options: UseMediaDevicesOptions): UseMediaDevices {
  const { kind, onError, requestPermissions = false } = options;

  const devices = shallowRef<MediaDeviceInfo[]>([]);

  const canSelectAudioOutput = ref<boolean>('setSinkId' in HTMLAudioElement.prototype);

  const handleError = (e: unknown): void => {
    onError?.(e instanceof Error ? e : new Error(String(e)));
  };

  const requestPermission = async (kind: 'audio' | 'video' | 'both'): Promise<boolean> => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: kind === 'audio' || kind === 'both',
        video: kind === 'video' || kind === 'both',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach((track) => track.stop());

      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  watchEffect((onCleanup) => {
    const observer = createMediaDeviceObserver(kind, onError, requestPermissions);
    if (!observer) {
      return;
    }

    const subscription = observer.subscribe({
      next: (deviceList: MediaDeviceInfo[]) => {
        devices.value = deviceList;
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  watchEffect((onCleanup) => {
    const refreshDevices = () => {
      navigator.mediaDevices.enumerateDevices().catch(handleError);
    };

    navigator.mediaDevices.addEventListener('devicechange', refreshDevices);
    onCleanup(() => navigator.mediaDevices.removeEventListener('devicechange', refreshDevices));
  });

  return {
    devices,
    canSelectAudioOutput,
    requestPermission,
  };
}
