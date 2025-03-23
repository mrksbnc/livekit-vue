import { useEnsureRoomContext } from '@/context/room.context';
import { setupStartVideo } from '@livekit/components-core';
import { useObservable } from '@vueuse/rxjs';
import type { Room } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, ref, toRefs, type HTMLAttributes } from 'vue';
import { useObservableState } from './private/useObservableState';

export type UseStartVideoProps = {
  room?: Room;
  props: HTMLAttributes;
};

export function useStartVideo({ room, props }: UseStartVideoProps) {
  const roomEnsured = useEnsureRoomContext(room);

  const setupStartVideoResult = computed<ReturnType<typeof setupStartVideo>>(() =>
    setupStartVideo(),
  );

  const { className, roomVideoPlaybackAllowedObservable, handleStartVideoPlayback } = toRefs(
    setupStartVideoResult.value,
  );

  const observable = useObservable(
    roomVideoPlaybackAllowedObservable.value(roomEnsured.value) as unknown as Observable<{
      canPlayVideo: boolean;
    }>,
  );

  const canPlayVideoObj = useObservableState({
    observable: observable.value as unknown as Observable<{ canPlayVideo: boolean }>,
    startWith: {
      canPlayVideo: roomEnsured.value.canPlaybackVideo,
    },
  });

  return {
    canPlayVideo: ref(canPlayVideoObj.value.canPlayVideo),
    elementProps: {
      class: className.value,
      onClick: () => {
        handleStartVideoPlayback.value(roomEnsured.value);
      },
    },
  };
}
