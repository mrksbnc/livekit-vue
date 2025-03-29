import { useEnsureParticipant } from '@/context/participant.context';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import type { Participant, Track } from 'livekit-client';
import { computed, type ComputedRef, type Ref } from 'vue';
import { useTrackRefBySourceOrName } from './useTrackRefBySourceOrName';

export type UseTrack = {
  trackReference: Ref<TrackReferenceOrPlaceholder>;
  isTrackAvailable: ComputedRef<boolean>;
};

export type UseTrackProps = {
  source: Track.Source;
  participant?: Participant;
};

export function useTrack(props: UseTrackProps): UseTrack {
  const participant = useEnsureParticipant(props.participant);

  const { trackReference } = useTrackRefBySourceOrName({
    source: props.source,
    participant: participant.value,
  });

  const isTrackAvailable = computed<boolean>(
    () => !!(trackReference.value.publication?.track && !trackReference.value.publication.isMuted),
  );

  return { trackReference, isTrackAvailable };
}
