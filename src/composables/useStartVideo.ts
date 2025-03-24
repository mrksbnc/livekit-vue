import { useEnsureRoomContext } from '@/context/room.context';
import { setupStartVideo } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Room } from 'livekit-client';
import { computed, ref, toRefs, type HTMLAttributes, type ShallowRef } from 'vue';

export type UseStartVideoProps = {
  room?: Room;
  props: HTMLAttributes;
};

export type UseStartVideoReturnType = {
  canPlayVideo: ShallowRef<boolean>;
  elementProps: HTMLAttributes;
};

export function useStartVideo({ room, props }: UseStartVideoProps): UseStartVideoReturnType {
  const roomEnsured = useEnsureRoomContext(room);

  const canPlayVideo = ref<boolean>(false);

  const setupStartVideoResult = computed<ReturnType<typeof setupStartVideo>>(() =>
    setupStartVideo(),
  );

  const { className, roomVideoPlaybackAllowedObservable, handleStartVideoPlayback } = toRefs(
    setupStartVideoResult.value,
  );

  useSubscription(
    roomVideoPlaybackAllowedObservable.value(roomEnsured.value).subscribe((evt) => {
      canPlayVideo.value = evt.canPlayVideo;
    }),
  );

  return {
    canPlayVideo,
    elementProps: {
      ...props,
      class: className.value,
      onClick: () => {
        handleStartVideoPlayback.value(roomEnsured.value);
      },
    },
  };
}
