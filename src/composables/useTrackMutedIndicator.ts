import { useEnsureTrackRef } from '@/context/track_reference.context';
import {
  setupTrackMutedIndicator,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import { computed, ref, toRefs, type Ref } from 'vue';

export type UseTrackMutedIndicator = {
  isMuted: Ref<boolean>;
};

export function useTrackMutedIndicator(
  trackRef?: TrackReferenceOrPlaceholder,
): UseTrackMutedIndicator {
  const trackReference = useEnsureTrackRef(trackRef);
  const isMuted = ref<boolean>(false);

  const mediaTrackSetupResult = computed<ReturnType<typeof setupTrackMutedIndicator>>(() =>
    setupTrackMutedIndicator(trackReference.value),
  );

  const { mediaMutedObserver } = toRefs(mediaTrackSetupResult.value);

  useSubscription(
    mediaMutedObserver.value?.subscribe((muted) => {
      isMuted.value = muted;
    }),
  );

  return { isMuted };
}
