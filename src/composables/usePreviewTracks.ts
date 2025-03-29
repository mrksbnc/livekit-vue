import type { LocalTrack, Track } from 'livekit-client';
import { createLocalTracks } from 'livekit-client';
import { onMounted, onUnmounted, ref, shallowRef, type Ref, type ShallowRef } from 'vue';

export type UsePreviewTracksProps = {
  audio?: boolean;
  video?: boolean;
  onError?: (error: Error) => void;
};

export type UsePreviewTracks = {
  tracks: ShallowRef<LocalTrack<Track.Kind>[]>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
};

export function usePreviewTracks(props: UsePreviewTracksProps = {}): UsePreviewTracks {
  const { audio = true, video = true, onError } = props;

  const isLoading = ref<boolean>(true);
  const error = ref<Error | null>(null);
  const tracks = shallowRef<LocalTrack<Track.Kind>[]>([]);

  const createTracks = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const newTracks = await createLocalTracks({
        audio,
        video,
      });

      tracks.value = newTracks;
    } catch (err) {
      console.error('Failed to create local tracks', err);

      if (err instanceof Error) {
        error.value = err;
        onError?.(err);
      } else {
        const fallbackError = new Error('Unknown error creating local tracks');
        error.value = fallbackError;
        onError?.(fallbackError);
      }
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    createTracks();
  });

  onUnmounted(() => {
    for (const track of tracks.value) {
      track.stop();
    }

    tracks.value = [];
  });

  return {
    tracks,
    isLoading,
    error,
  };
}
