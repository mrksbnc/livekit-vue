import { useEnsureParticipant } from '@/context/participant.context';
import type { Participant, Track } from 'livekit-client';
import { useTrackRefBySourceOrName } from './useTrackRefBySourceOrName';

export function useTrack(
  source: Track.Source,
  participant?: Participant,
): ReturnType<typeof useTrackRefBySourceOrName> {
  const p = useEnsureParticipant(participant);
  return useTrackRefBySourceOrName({ source, participant: p.value });
}
