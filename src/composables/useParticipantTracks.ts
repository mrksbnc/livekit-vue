import { useMaybeParticipantContext } from '@/context/participant.context';
import { useRoomContext } from '@/context/room.context';
import { participantTracksObservable, type TrackReference } from '@livekit/components-core';
import type { Participant, Track } from 'livekit-client';
import { computed, shallowRef, watchEffect, type ShallowRef } from 'vue';

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

  const participant = computed<Participant | undefined>(() => {
    if (options.participantIdentity && room?.value) {
      return room.value.getParticipantByIdentity(options.participantIdentity);
    }
    return participantContext?.value;
  });

  watchEffect((onCleanup) => {
    if (!participant.value) {
      trackReferences.value = [];
      return;
    }

    const observable = participantTracksObservable(participant.value, {
      sources: options.sources,
    });

    const subscription = observable.subscribe({
      next: (tracks) => {
        trackReferences.value = tracks;
      },
      error: (err) => {
        console.error('Error in participant tracks observable:', err);
        trackReferences.value = [];
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return { trackReferences };
}
