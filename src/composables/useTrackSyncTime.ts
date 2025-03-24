import { trackSyncTimeObserver, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import { Observable } from 'rxjs';
import { computed, onMounted, ref, watch, type Ref } from 'vue';

export type UseTrackSyncTimeData = {
  timestamp: number;
  rtpTimestamp: number | undefined;
};

export type UseTrackSyncTime = {
  data: Ref<UseTrackSyncTimeData>;
};

export function useTrackSyncTime(
  reference: TrackReferenceOrPlaceholder | undefined,
): UseTrackSyncTime {
  const observable = computed<Observable<number> | undefined>(() => {
    return reference?.publication?.track
      ? (trackSyncTimeObserver(reference?.publication.track) as unknown as Observable<number>)
      : undefined;
  });

  const dataRef = ref<UseTrackSyncTimeData>({
    timestamp: Date.now(),
    rtpTimestamp: reference?.publication?.track?.rtpTimestamp,
  });

  watch(
    () => observable.value,
    (val) => {
      if (val) {
        useSubscription(
          val.subscribe((data) => {
            dataRef.value.timestamp = data;
          }),
        );
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    if (!observable.value) {
      throw new Error('Please provide a valid observable when using `useTrackSyncTime`');
    }
  });

  return {
    data: dataRef,
  };
}
