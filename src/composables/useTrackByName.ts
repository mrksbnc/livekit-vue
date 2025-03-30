import { useEnsureParticipant } from '@/context/participant.context';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import type { Ref } from 'vue';
import { useTrackRefBySourceOrName } from './useTrackRefBySourceOrName';

export type UseTrackByName = {
  trackReference: Ref<TrackReferenceOrPlaceholder>;
};

export type UseTrackByNameProps = {
  name: string;
  participant?: Participant;
};

export function useTrackByName(props: UseTrackByNameProps): UseTrackByName {
  const { name, participant } = props;
  const ensuredParticipant = useEnsureParticipant(participant);

  return useTrackRefBySourceOrName({
    name,
    participant: ensuredParticipant.value,
  });
}
