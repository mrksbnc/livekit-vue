import { trackSyncTimeObserver, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { computed, ref, watchEffect, type Ref } from 'vue';

export type UseTrackSyncTimeData = {
  timestamp: number;
  rtpTimestamp: number | undefined;
};

export type UseTrackSyncTime = {
  data: Ref<UseTrackSyncTimeData>;
};

export type UseTrackSyncTimeProps = {
  trackRef: TrackReferenceOrPlaceholder | undefined;
};

export function useTrackSyncTime(props: UseTrackSyncTimeProps): UseTrackSyncTime {
  const data = ref<UseTrackSyncTimeData>({
    timestamp: Date.now(),
    rtpTimestamp: props.trackRef?.publication?.track?.rtpTimestamp,
  });

  const observable = computed<ReturnType<typeof trackSyncTimeObserver> | undefined>(() => {
    if (!props.trackRef?.publication?.track) {
      return undefined;
    }
    try {
      return trackSyncTimeObserver(props.trackRef.publication.track);
    } catch (error) {
      console.error('Failed to create track sync time observer:', error);
      return undefined;
    }
  });

  watchEffect((onCleanup) => {
    const currentObservable = observable.value;
    if (!currentObservable) {
      return;
    }

    try {
      const subscription = currentObservable.subscribe({
        next: (timestamp) => {
          data.value = {
            timestamp,
            rtpTimestamp: props.trackRef?.publication?.track?.rtpTimestamp,
          };
        },
        error: (err) => {
          console.error('Error in track sync time subscription:', err);
        },
      });

      onCleanup(() => subscription.unsubscribe());
    } catch (error) {
      console.error('Failed to subscribe to track sync time:', error);
    }
  });

  return { data };
}
