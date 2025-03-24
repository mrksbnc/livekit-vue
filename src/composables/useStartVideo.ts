import { useEnsureRoomContext } from '@/context/room.context';
import { setupStartVideo } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Room } from 'livekit-client';
import { computed, ref, toRefs, type HTMLAttributes, type Ref } from 'vue';

export type UseStartVideoProps = {
  room?: Room;
  props: HTMLAttributes;
};

export type UseStartVideo = {
  canPlayVideo: Ref<boolean>;
  onClick: () => Promise<void>;
};

export function useStartVideo({ room, props }: UseStartVideoProps): UseStartVideo {
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

  async function onClick(): Promise<void> {
    await handleStartVideoPlayback.value(roomEnsured.value);
  }

  return {
    canPlayVideo,
    onClick,
  };
}
