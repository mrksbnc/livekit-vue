import { useMaybeRoomContext } from '@/context';
import { createMediaDeviceObserver, setupDeviceSelector } from '@livekit/components-core';
import { Room, type LocalAudioTrack, type LocalVideoTrack } from 'livekit-client';
import { computed, ref, shallowRef, watchEffect, type Ref } from 'vue';

export type UseMediaDeviceSelectOptions = {
  kind: MediaDeviceKind;
  room?: Room;
  track?: LocalAudioTrack | LocalVideoTrack;
  /**
   * this will call getUserMedia if the permissions are not yet given to enumerate the devices with device labels.
   * in some browsers multiple calls to getUserMedia result in multiple permission prompts.
   * It's generally advised only flip this to true, once a (preview) track has been acquired successfully with the
   * appropriate permissions.
   *
   * @see {@link MediaDeviceMenu}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices | MDN enumerateDevices}
   */
  requestPermissions?: boolean;
  onError?: (e: Error) => void;
};

export type UseMediaDeviceSelect = {
  devices: Ref<MediaDeviceInfo[]>;
  activeDeviceId: Ref<string | undefined>;
  setActiveMediaDevice: (deviceId: string) => void;
};

export function useMediaDeviceSelect(options: UseMediaDeviceSelectOptions): UseMediaDeviceSelect {
  const { kind, track, requestPermissions, onError } = options;
  const roomContext = useMaybeRoomContext();

  const devices = shallowRef<MediaDeviceInfo[]>([]);

  const room = computed<Room>(() => options.room ?? roomContext?.value ?? new Room());

  const activeDeviceId = ref<string | undefined>(room.value?.getActiveDevice(kind) ?? 'default');

  const deviceSelector = computed<ReturnType<typeof setupDeviceSelector>>(() =>
    setupDeviceSelector(kind, room.value, track),
  );

  const setActiveMediaDevice = (deviceId: string): void => {
    try {
      deviceSelector.value.setActiveMediaDevice(deviceId);
    } catch (e) {
      onError?.(e instanceof Error ? e : new Error(String(e)));
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
      error: (err) => {
        console.error('Error in media device observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  watchEffect((onCleanup) => {
    const observable = deviceSelector.value.activeDeviceObservable;
    if (!observable) {
      return;
    }

    const subscription = observable.subscribe({
      next: (deviceId) => {
        if (deviceId) {
          activeDeviceId.value = deviceId;
        }
      },
      error: (err) => {
        console.error('Error in media device observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  watchEffect((onCleanup) => {
    const refreshDevices = () => {
      navigator.mediaDevices
        .enumerateDevices()
        .catch((e) => onError?.(e instanceof Error ? e : new Error(String(e))));
    };

    navigator.mediaDevices.addEventListener('devicechange', refreshDevices);
    onCleanup(() => navigator.mediaDevices.removeEventListener('devicechange', refreshDevices));
  });

  return {
    devices,
    activeDeviceId,
    setActiveMediaDevice,
  };
}
