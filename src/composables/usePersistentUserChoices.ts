import { loadUserChoices, saveUserChoices, type LocalUserChoices } from '@livekit/components-core';
import { ref, watchEffect, type Ref } from 'vue';

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
  let initialChoices: LocalUserChoices;

  try {
    initialChoices = loadUserChoices(options.defaults, options.preventLoad ?? false);
  } catch (error) {
    console.error('Error loading user choices:', error);
    initialChoices = (options.defaults as LocalUserChoices) || ({} as LocalUserChoices);
  }

  const userChoices = ref<LocalUserChoices>(initialChoices);

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

  watchEffect(() => {
    try {
      saveUserChoices(userChoices.value, options.preventSave ?? false);
    } catch (error) {
      console.error('Error saving user choices:', error);
    }
  });

  return {
    userChoices,
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
    saveUsername,
  };
}
