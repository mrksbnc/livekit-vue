import {
  getTrackByIdentifier,
  setupMediaTrack,
  type TrackReferenceOrPlaceholder,
  type TrackSource,
} from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import { Track, TrackPublication } from 'livekit-client';
import { computed, ref, toRefs, type Ref } from 'vue';

export function useTrackRefBySourceOrName(
  source: TrackSource<Track.Source>,
): Ref<TrackReferenceOrPlaceholder> {
  const publication = ref<TrackPublication | undefined>(getTrackByIdentifier(source));

  const mediaTrackSetupResult = computed<ReturnType<typeof setupMediaTrack>>(() =>
    setupMediaTrack(source),
  );

  const { trackObserver } = toRefs(mediaTrackSetupResult.value);

  useSubscription(
    trackObserver.value.subscribe((pub) => {
      publication.value = pub;
    }),
  );

  return ref({
    participant: source.participant,
    source: source.source ?? Track.Source.Unknown,
    publication: publication.value as TrackPublication,
  }) as Ref<TrackReferenceOrPlaceholder>;
}
