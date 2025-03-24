import { useEnsureParticipant } from '@/context/participant.context';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import type { Ref } from 'vue';
import { useTrackRefBySourceOrName } from './useTrackRefBySourceOrName';

export type UseTrackByName = {
  trackReference: Ref<TrackReferenceOrPlaceholder>;
};

export function useTrackByName(name: string, participant?: Participant): UseTrackByName {
  const p = useEnsureParticipant(participant);
  const { trackReference } = useTrackRefBySourceOrName({ name, participant: p.value });

  return { trackReference };
}
