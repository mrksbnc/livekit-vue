import { useEnsureParticipant } from '@/context/participant.context';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import type { Participant, Track } from 'livekit-client';
import type { Ref } from 'vue';
import { useTrackRefBySourceOrName } from './useTrackRefBySourceOrName';

export type UseTrack = {
  trackReference: Ref<TrackReferenceOrPlaceholder>;
};

export function useTrack(source: Track.Source, participant?: Participant): UseTrack {
  const p = useEnsureParticipant(participant);

  const { trackReference } = useTrackRefBySourceOrName({ source, participant: p.value });
  return { trackReference };
}
