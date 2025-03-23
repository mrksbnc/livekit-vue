import { trackSyncTimeObserver, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { useObservable } from '@vueuse/rxjs';
import type { Observable } from 'rxjs';
import type { ShallowRef } from 'vue';
import { useObservableState } from './private/useObservableState';

export function useTrackSyncTime(ref: TrackReferenceOrPlaceholder | undefined): ShallowRef<{
  timestamp: number;
  rtpTimestamp: number | undefined;
}> {
  const observable = ref?.publication?.track
    ? // @ts-expect-error - Observer type mismatch
      useObservable(trackSyncTimeObserver(ref?.publication.track))
    : undefined;

  if (!observable) {
    throw new Error('Please provide a valid observable when using `useTrackSyncTime`');
  }

  const observedState = useObservableState({
    observable: observable?.value as unknown as Observable<{
      timestamp: number;
      rtpTimestamp: number;
    }>,
    startWith: {
      timestamp: Date.now(),
      rtpTimestamp: ref?.publication?.track?.rtpTimestamp,
    },
  });

  return observedState;
}
