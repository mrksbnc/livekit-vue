import { trackSyncTimeObserver, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { useObservable } from '@vueuse/rxjs';
import { useObservableState } from './private/useObservableState';

export function useTrackSyncTime(ref: TrackReferenceOrPlaceholder | undefined) {
  const observable = ref?.publication?.track
    ? // @ts-expect-error - TODO: fix types
      useObservable(trackSyncTimeObserver(ref?.publication.track))
    : undefined;

  if (!observable) {
    throw new Error('Please provide a valid observable when using `useTrackSyncTime`');
  }

  return useObservableState({
    // @ts-expect-error - TODO: fix types
    observable: observable.value,
    startWith: {
      timestamp: Date.now(),
      rtpTimestamp: ref?.publication?.track?.rtpTimestamp,
    },
  });
}
