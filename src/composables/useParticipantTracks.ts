import { useMaybeParticipantContext } from '@/context/participant.context';
import { useRoomContext } from '@/context/room.context';
import { participantTracksObservable, type TrackReference } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant, Track } from 'livekit-client';
import { computed, ref, type ShallowRef } from 'vue';

export function useParticipantTracks(
  sources: Track.Source[],
  participantIdentity?: string,
): ShallowRef<TrackReference[]> {
  const room = useRoomContext();
  const participantContext = useMaybeParticipantContext();

  const trackReferences = ref<TrackReference[]>([]);

  const p = computed<Participant | undefined>(() =>
    participantIdentity
      ? room?.value?.getParticipantByIdentity(participantIdentity)
      : participantContext?.value,
  );

  useSubscription(
    participantTracksObservable(p.value ?? ({} as Participant), { sources }).subscribe((v) => {
      trackReferences.value = v;
    }),
  );

  return trackReferences as ShallowRef<TrackReference[]>;
}
