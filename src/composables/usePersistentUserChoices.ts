import { loadUserChoices, saveUserChoices, type LocalUserChoices } from '@livekit/components-core';
import { ref, watch, type ShallowRef } from 'vue';

export type UsePersistentUserChoicesOptions = {
  defaults?: Partial<LocalUserChoices>;
  preventSave?: boolean;
  preventLoad?: boolean;
};

export type UsePersistentUserChoicesReturnType = {
  userChoices: ShallowRef<LocalUserChoices>;
  saveAudioInputEnabled: (enabled: boolean) => void;
  saveVideoInputEnabled: (enabled: boolean) => void;
  saveAudioInputDeviceId: (deviceId: string) => void;
  saveVideoInputDeviceId: (deviceId: string) => void;
  saveUsername: (username: string) => void;
};

export function usePersistentUserChoices(
  options: UsePersistentUserChoicesOptions = {},
): UsePersistentUserChoicesReturnType {
  const userChoices = ref<LocalUserChoices>(
    loadUserChoices(options.defaults, options.preventLoad ?? false),
  );

  function saveAudioInputDeviceId(deviceId: string) {
    userChoices.value = { ...userChoices.value, audioDeviceId: deviceId };
  }

  function saveVideoInputDeviceId(deviceId: string) {
    userChoices.value = { ...userChoices.value, videoDeviceId: deviceId };
  }

  function saveAudioInputEnabled(enabled: boolean) {
    userChoices.value = { ...userChoices.value, audioEnabled: enabled };
  }

  function saveVideoInputEnabled(enabled: boolean) {
    userChoices.value = { ...userChoices.value, videoEnabled: enabled };
  }

  function saveUsername(username: string) {
    userChoices.value = { ...userChoices.value, username };
  }

  watch(
    [userChoices, options.preventSave],
    () => {
      saveUserChoices(userChoices.value, options.preventSave ?? false);
    },
    {
      deep: true,
    },
  );

  return {
    userChoices,
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
    saveUsername,
  };
}
