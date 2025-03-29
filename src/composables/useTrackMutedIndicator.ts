import { useEnsureTrackRef } from '@/context/track_reference.context';
import {
  setupTrackMutedIndicator,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-core';
import { computed, ref, watchEffect, type Ref } from 'vue';

export type UseTrackMutedIndicator = {
  isMuted: Ref<boolean>;
};

export type UseTrackMutedIndicatorProps = {
  trackRef: TrackReferenceOrPlaceholder;
};

export function useTrackMutedIndicator(props: UseTrackMutedIndicatorProps): UseTrackMutedIndicator {
  const trackReference = useEnsureTrackRef(props.trackRef);

  const isMuted = ref<boolean>(
    !!(
      trackReference.value.publication?.isMuted ||
      trackReference.value.participant.getTrackPublication(trackReference.value.source)?.isMuted
    ),
  );

  const mutedIndicator = computed<ReturnType<typeof setupTrackMutedIndicator>>(() =>
    setupTrackMutedIndicator(trackReference.value),
  );

  watchEffect((onCleanup) => {
    const observer = mutedIndicator.value.mediaMutedObserver;
    if (!observer) {
      return;
    }

    const subscription = observer.subscribe({
      next: (muted) => {
        isMuted.value = muted;
      },
      error: (err) => {
        console.error('Error in media muted observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return {
    isMuted,
  };
}
