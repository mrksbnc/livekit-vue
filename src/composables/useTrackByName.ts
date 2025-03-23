import { useEnsureParticipant } from '@/context/participant.context';
import type { Participant } from 'livekit-client';
import { useTrackRefBySourceOrName } from './useTrackRefBySourceOrName';

export function useTrackByName(name: string, participant?: Participant) {
  const p = useEnsureParticipant(participant);
  return useTrackRefBySourceOrName({ name, participant: p.value });
}
