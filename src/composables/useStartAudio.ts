import { useEnsureRoomContext } from '@/context/room.context';
import { setupStartAudio } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';

export type UseStartAudioProps = {
  room?: Room;
};

export type UseStartAudio = {
  canPlayAudio: Ref<boolean>;
  onClick: () => Promise<void>;
};

export function useStartAudio(room?: Room): UseStartAudio {
  const roomEnsured = useEnsureRoomContext(room);
  const canPlayAudio = ref<boolean>(roomEnsured.value?.canPlaybackAudio ?? false);
  const setupStartAudioResult = computed(() => setupStartAudio());

  watchEffect((onCleanup) => {
    if (!roomEnsured.value) {
      return;
    }

    const observable = setupStartAudioResult.value.roomAudioPlaybackAllowedObservable(
      roomEnsured.value,
    );

    const subscription = observable.subscribe({
      next: (evt) => {
        canPlayAudio.value = evt.canPlayAudio;
      },
      error: (err) => {
        console.error('Error in room audio playback allowed observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  async function onClick(): Promise<void> {
    if (roomEnsured.value) {
      await setupStartAudioResult.value.handleStartAudioPlayback(roomEnsured.value);
    }
  }

  return { canPlayAudio, onClick };
}
