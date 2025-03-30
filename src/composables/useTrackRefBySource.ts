import {
  getTrackByIdentifier,
  setupMediaTrack,
  type TrackIdentifier,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-core';
import { Track, TrackPublication } from 'livekit-client';
import { computed, ref, watchEffect, type ComputedRef } from 'vue';

export type UseTrackRefBySourceOrName = {
  trackReference: ComputedRef<TrackReferenceOrPlaceholder>;
};

export type UseTrackRefBySourceOrNameProps = {
  options: TrackIdentifier;
};

export function useTrackRefBySource(
  props: UseTrackRefBySourceOrNameProps,
): UseTrackRefBySourceOrName {
  const publication = ref<TrackPublication | undefined>(getTrackByIdentifier(props.options));

  const mediaTrackSetup = computed<ReturnType<typeof setupMediaTrack>>(() =>
    setupMediaTrack(props.options),
  );

  watchEffect((onCleanup) => {
    const observer = mediaTrackSetup.value.trackObserver;
    if (!observer) {
      return;
    }

    try {
      const subscription = observer.subscribe({
        next: (pub) => {
          publication.value = pub;
        },
        error: (err) => {
          console.error('Error in track observer:', err);
        },
      });

      onCleanup(() => subscription.unsubscribe());
    } catch (error) {
      console.error('Failed to subscribe to track observer:', error);
    }
  });

  const trackReference = computed<TrackReferenceOrPlaceholder>(() => ({
    participant: props.options.participant,
    source: props.options.source ?? Track.Source.Unknown,
    publication: publication.value as TrackPublication,
  }));

  return { trackReference };
}
