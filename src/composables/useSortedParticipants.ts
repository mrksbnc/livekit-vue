import { sortParticipants } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { shallowRef, watchEffect, type ShallowRef } from 'vue';
import { useSpeakingParticipants } from './useSpeakingParticipants';

export type UseSortedParticipants = {
  sortedParticipants: ShallowRef<Participant[]>;
};

export function useSortedParticipants(
  participants: Array<Participant> = [],
): UseSortedParticipants {
  const { activeSpeakers } = useSpeakingParticipants();

  const sortedParticipants = shallowRef<Participant[]>(
    sortParticipants([...participants, ...activeSpeakers.value]),
  );

  watchEffect(() => {
    if (!participants || participants.length === 0) {
      sortedParticipants.value = [];
      return;
    }

    sortedParticipants.value = sortParticipants(participants);
  });

  return { sortedParticipants };
}
