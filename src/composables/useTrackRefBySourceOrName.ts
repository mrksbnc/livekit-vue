import {
  getTrackByIdentifier,
  setupMediaTrack,
  type TrackReferenceOrPlaceholder,
  type TrackSource,
} from '@livekit/components-core';
import { Track, TrackPublication } from 'livekit-client';
import { computed, ref, watchEffect, type ComputedRef } from 'vue';

export type UseTrackRefBySourceOrName = {
  trackReference: ComputedRef<TrackReferenceOrPlaceholder>;
};

export function useTrackRefBySourceOrName(
  source: TrackSource<Track.Source>,
): UseTrackRefBySourceOrName {
  const publication = ref<TrackPublication | undefined>(getTrackByIdentifier(source));

  const mediaTrackSetup = computed<ReturnType<typeof setupMediaTrack>>(() =>
    setupMediaTrack(source),
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
    participant: source.participant,
    source: source.source ?? Track.Source.Unknown,
    publication: publication.value as TrackPublication,
  }));

  return { trackReference };
}
