import { useEnsureRoomContext } from '@/context/room.context';
import { setupStartAudio } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Room } from 'livekit-client';
import { computed, ref, toRefs, type Ref } from 'vue';

export type UseStartAudioProps = {
  room?: Room;
};

export type UseStartAudio = {
  canPlayAudio: Ref<boolean>;
  onClick: () => Promise<void>;
};

export function useStartAudio(room?: Room): UseStartAudio {
  const roomEnsured = useEnsureRoomContext(room);

  const canPlayAudio = ref<boolean>(false);

  const setupStartAudioResult = computed(() => setupStartAudio());

  const { roomAudioPlaybackAllowedObservable, handleStartAudioPlayback } = toRefs(
    setupStartAudioResult.value,
  );

  useSubscription(
    roomAudioPlaybackAllowedObservable.value(roomEnsured.value).subscribe((evt) => {
      canPlayAudio.value = evt.canPlayAudio;
    }),
  );

  async function onClick(): Promise<void> {
    await handleStartAudioPlayback.value(roomEnsured.value);
  }

  return {
    canPlayAudio,
    onClick,
  };
}
