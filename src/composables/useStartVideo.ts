import { useEnsureRoomContext } from '@/context/room.context';
import { setupStartVideo } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';

export type UseStartVideoProps = {
  room?: Room;
};

export type UseStartVideo = {
  canPlayVideo: Ref<boolean>;
  onClick: () => Promise<void>;
};

export function useStartVideo({ room }: UseStartVideoProps): UseStartVideo {
  const roomEnsured = useEnsureRoomContext(room);

  const canPlayVideo = ref<boolean>(roomEnsured.value?.canPlaybackVideo ?? false);

  const setupStartVideoResult = computed<ReturnType<typeof setupStartVideo>>(() =>
    setupStartVideo(),
  );

  watchEffect((onCleanup) => {
    if (!roomEnsured.value) {
      return;
    }

    const observable = setupStartVideoResult.value.roomVideoPlaybackAllowedObservable(
      roomEnsured.value,
    );

    const subscription = observable.subscribe({
      next: (evt) => {
        canPlayVideo.value = evt.canPlayVideo;
      },
      error: (err) => {
        console.error('Error in room video playback allowed observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  async function onClick(): Promise<void> {
    if (roomEnsured.value) {
      await setupStartVideoResult.value.handleStartVideoPlayback(roomEnsured.value);
    }
  }

  return { canPlayVideo, onClick };
}
