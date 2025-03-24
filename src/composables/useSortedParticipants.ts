import { sortParticipants } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { shallowRef, watch, type ShallowRef } from 'vue';
import { useSpeakingParticipants } from './useSpeakingParticipants';

export type UseSortedParticipants = {
  sortedParticipants: ShallowRef<Participant[]>;
};

export function useSortedParticipants(participants: Array<Participant>): UseSortedParticipants {
  const activeSpeakers = useSpeakingParticipants();
  const sortedParticipants = shallowRef<Participant[]>(sortParticipants(participants));

  watch(
    [activeSpeakers, participants],
    () => {
      sortedParticipants.value = sortParticipants(participants);
    },
    {
      deep: true,
    },
  );

  return { sortedParticipants };
}
