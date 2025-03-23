import { useMaybeParticipantContext } from '@/context/participant.context';
import { useRoomContext } from '@/context/room.context';
import { participantTracksObservable, type TrackReference } from '@livekit/components-core';
import type { Participant, Track } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, type ShallowRef } from 'vue';
import { useObservableState } from './private/useObservableState';

export function useParticipantTracks(
  sources: Track.Source[],
  participantIdentity?: string,
): ShallowRef<TrackReference[]> {
  const room = useRoomContext();
  const participantContext = useMaybeParticipantContext();

  const p = computed<Participant | undefined>(() =>
    participantIdentity
      ? room?.value?.getParticipantByIdentity(participantIdentity)
      : participantContext?.value,
  );

  const observable = computed<Observable<TrackReference[]> | undefined>(() => {
    return p.value
      ? (participantTracksObservable(p.value, { sources }) as unknown as Observable<
          TrackReference[]
        >)
      : undefined;
  });

  const trackRefs = useObservableState<TrackReference[]>({
    observable: observable.value,
    startWith: [],
  });

  return trackRefs;
}
