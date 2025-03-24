import { useEnsureTrackRef } from '@/context/track_reference.context';
import {
  setupTrackMutedIndicator,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import { computed, ref, toRefs, type ShallowRef } from 'vue';

export function useTrackMutedIndicator(trackRef?: TrackReferenceOrPlaceholder): {
  isMuted: ShallowRef<boolean>;
  className: ShallowRef<string>;
} {
  const trackReference = useEnsureTrackRef(trackRef);
  const isMuted = ref<boolean>(false);

  const mediaTrackSetupResult = computed<ReturnType<typeof setupTrackMutedIndicator>>(() =>
    setupTrackMutedIndicator(trackReference.value),
  );

  const { className, mediaMutedObserver } = toRefs(mediaTrackSetupResult.value);

  useSubscription(
    mediaMutedObserver.value?.subscribe((muted) => {
      isMuted.value = muted;
    }),
  );

  return { isMuted, className };
}
