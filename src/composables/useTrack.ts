import { useEnsureParticipant } from '@/context/participant.context';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import type { Participant, Track } from 'livekit-client';
import { computed, type ComputedRef, type Ref } from 'vue';
import { useTrackRefBySourceOrName } from './useTrackRefBySourceOrName';

export type UseTrack = {
  trackReference: Ref<TrackReferenceOrPlaceholder>;
  isTrackAvailable: ComputedRef<boolean>;
};

export function useTrack(source: Track.Source, participant?: Participant): UseTrack {
  const p = useEnsureParticipant(participant);

  const { trackReference } = useTrackRefBySourceOrName({ source, participant: p.value });

  const isTrackAvailable = computed<boolean>(
    () => !!(trackReference.value.publication?.track && !trackReference.value.publication.isMuted),
  );

  return { trackReference, isTrackAvailable };
}
