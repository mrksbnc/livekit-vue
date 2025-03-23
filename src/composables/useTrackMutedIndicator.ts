import { useEnsureTrackRef } from '@/context/track_reference.context';
import {
  setupTrackMutedIndicator,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-core';
import { useObservable } from '@vueuse/rxjs';
import type { Observable } from 'rxjs';
import { computed, toRefs, type Ref } from 'vue';
import { useObservableState } from './private/useObservableState';

type TrackMutedIndicatorReturnType = {
  isMuted: Ref<boolean>;
  className: Ref<string>;
};

export function useTrackMutedIndicator(
  trackRef?: TrackReferenceOrPlaceholder,
): TrackMutedIndicatorReturnType {
  const trackReference = useEnsureTrackRef(trackRef);

  const mediaTrackSetupResult = computed<ReturnType<typeof setupTrackMutedIndicator>>(() =>
    setupTrackMutedIndicator(trackReference.value),
  );

  const { className, mediaMutedObserver } = toRefs(mediaTrackSetupResult.value);

  const observable = useObservable(mediaMutedObserver.value as unknown as Observable<boolean>);

  const isMuted = useObservableState({
    observable: observable.value as unknown as Observable<boolean>,
    startWith: !!(
      trackReference.value.publication?.isMuted ||
      trackReference.value.participant.getTrackPublication(trackReference.value.source)?.isMuted
    ),
  });

  return { isMuted, className };
}
