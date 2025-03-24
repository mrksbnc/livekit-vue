import { useMaybeParticipantContext } from '@/context/participant.context';
import { useRoomContext } from '@/context/room.context';
import { participantTracksObservable, type TrackReference } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant, Track } from 'livekit-client';
import { computed, shallowRef, type ShallowRef } from 'vue';

export type UseParticipantTracksOptions = {
  sources: Track.Source[];
  participantIdentity?: string;
};

export type UseParticipantTracks = {
  trackReferences: ShallowRef<TrackReference[]>;
};

export function useParticipantTracks(options: UseParticipantTracksOptions): UseParticipantTracks {
  const room = useRoomContext();
  const participantContext = useMaybeParticipantContext();

  const trackReferences = shallowRef<TrackReference[]>([]);

  const p = computed<Participant | undefined>(() =>
    options.participantIdentity
      ? room?.value?.getParticipantByIdentity(options.participantIdentity)
      : participantContext?.value,
  );

  useSubscription(
    participantTracksObservable(p.value ?? ({} as Participant), {
      sources: options.sources,
    }).subscribe((v) => {
      trackReferences.value = v;
    }),
  );

  return {
    trackReferences,
  };
}
