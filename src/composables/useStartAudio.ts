import { useEnsureRoomContext } from '@/context/room.context';
import { setupStartAudio } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Room } from 'livekit-client';
import { computed, ref, toRefs, type HTMLAttributes, type ShallowRef } from 'vue';

export type UseStartAudioProps = {
  room?: Room;
  props: HTMLAttributes;
};

export type UseStartAudioReturnType = {
  canPlayAudio: ShallowRef<boolean>;
  elementProps: HTMLAttributes;
};

export function useStartAudio({ room, props }: UseStartAudioProps): UseStartAudioReturnType {
  const roomEnsured = useEnsureRoomContext(room);

  const canPlayAudio = ref<boolean>(false);

  const setupStartAudioResult = computed(() => setupStartAudio());

  const { className, roomAudioPlaybackAllowedObservable, handleStartAudioPlayback } = toRefs(
    setupStartAudioResult.value,
  );

  useSubscription(
    roomAudioPlaybackAllowedObservable.value(roomEnsured.value).subscribe((evt) => {
      canPlayAudio.value = evt.canPlayAudio;
    }),
  );

  return {
    canPlayAudio,
    elementProps: {
      ...props,
      class: className.value,
      onClick: () => {
        handleStartAudioPlayback.value(roomEnsured.value);
      },
    },
  };
}
