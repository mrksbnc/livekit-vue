import { useEnsureRoomContext } from '@/context/room.context';
import { roomAudioPlaybackAllowedObservable } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';

export type UseAudioPlayback = {
  canPlayAudio: Ref<boolean>;
  startAudio: () => Promise<void>;
};

export function useAudioPlayback(room?: Room): UseAudioPlayback {
  const roomEnsured = useEnsureRoomContext(room);

  const canPlayAudio = ref<boolean>(roomEnsured.value?.canPlaybackAudio ?? false);

  const observable = computed<ReturnType<typeof roomAudioPlaybackAllowedObservable> | null>(() =>
    roomEnsured.value ? roomAudioPlaybackAllowedObservable(roomEnsured.value) : null,
  );

  const startAudio = async (): Promise<void> => {
    if (!roomEnsured.value) {
      return;
    }

    try {
      await roomEnsured.value.startAudio();
    } catch (error) {
      console.error('Failed to start audio playback:', error);
    }
  };

  watchEffect((onCleanup) => {
    const currentObservable = observable.value;
    if (!currentObservable) {
      return;
    }

    const subscription = currentObservable.subscribe({
      next: (evt) => {
        canPlayAudio.value = evt.canPlayAudio;
      },
      error: (err) => {
        console.error('Audio playback observable error:', err);
      },
    });

    onCleanup(() => {
      subscription.unsubscribe();
    });
  });

  return {
    canPlayAudio,
    startAudio,
  };
}
