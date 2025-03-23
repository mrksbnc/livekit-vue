import { useEnsureRoom } from '@/context/room.context';
import { setupStartAudio } from '@livekit/components-core';
import { useObservable } from '@vueuse/rxjs';
import type { Room } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, ref, toRefs, type HTMLAttributes, type Ref } from 'vue';
import { useObservableState } from './private/useObservableState';

export type UseStartAudioProps = {
  room?: Room;
  props: HTMLAttributes;
};

export function useStartAudio({ room, props }: UseStartAudioProps): Readonly<{
  canPlayAudio: Ref<boolean>;
  elementProps: HTMLAttributes;
}> {
  const roomEnsured = useEnsureRoom(room);

  const setupStartAudioResult = computed(() => setupStartAudio());

  const { className, roomAudioPlaybackAllowedObservable, handleStartAudioPlayback } = toRefs(
    setupStartAudioResult.value,
  );

  const observable = useObservable(
    roomAudioPlaybackAllowedObservable.value(roomEnsured.value) as unknown as Observable<{
      canPlayAudio: boolean;
    }>,
  );

  const canPlayAudioObj = useObservableState({
    observable: observable.value as unknown as Observable<{ canPlayAudio: boolean }>,
    startWith: {
      canPlayAudio: roomEnsured.value.canPlaybackVideo,
    },
  });

  const canPlayAudio = ref(canPlayAudioObj.value.canPlayAudio);

  return {
    canPlayAudio,
    elementProps: {
      class: className.value,
      onClick: () => {
        handleStartAudioPlayback.value(roomEnsured.value);
      },
    },
  };
}
