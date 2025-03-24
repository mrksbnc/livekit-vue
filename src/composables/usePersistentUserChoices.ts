import { loadUserChoices, saveUserChoices, type LocalUserChoices } from '@livekit/components-core';
import { ref, watch, type Ref } from 'vue';

export type UsePersistentUserChoicesOptions = {
  defaults?: Partial<LocalUserChoices>;
  preventSave?: boolean;
  preventLoad?: boolean;
};

export type UsePersistentUserChoices = {
  userChoices: Ref<LocalUserChoices>;
  saveAudioInputEnabled: (enabled: boolean) => void;
  saveVideoInputEnabled: (enabled: boolean) => void;
  saveAudioInputDeviceId: (deviceId: string) => void;
  saveVideoInputDeviceId: (deviceId: string) => void;
  saveUsername: (username: string) => void;
};

export function usePersistentUserChoices(
  options: UsePersistentUserChoicesOptions = {},
): UsePersistentUserChoices {
  const userChoices = ref<LocalUserChoices>(
    loadUserChoices(options.defaults, options.preventLoad ?? false),
  );

  function saveAudioInputDeviceId(deviceId: string): void {
    userChoices.value = { ...userChoices.value, audioDeviceId: deviceId };
  }

  function saveVideoInputDeviceId(deviceId: string): void {
    userChoices.value = { ...userChoices.value, videoDeviceId: deviceId };
  }

  function saveAudioInputEnabled(enabled: boolean): void {
    userChoices.value = { ...userChoices.value, audioEnabled: enabled };
  }

  function saveVideoInputEnabled(enabled: boolean): void {
    userChoices.value = { ...userChoices.value, videoEnabled: enabled };
  }

  function saveUsername(username: string): void {
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
