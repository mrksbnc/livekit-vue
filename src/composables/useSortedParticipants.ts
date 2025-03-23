import { sortParticipants } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { ref, watch, type Ref } from 'vue';
import { useSpeakingParticipants } from './useSpeakingParticipants';

export function useSortedParticipants(participants: Array<Participant>): Ref<Participant[]> {
  const activeSpeakers = useSpeakingParticipants();
  const sortedParticipants = ref<Participant[]>(sortParticipants(participants));

  watch(
    [activeSpeakers, participants],
    () => {
      sortedParticipants.value = sortParticipants(participants);
    },
    {
      deep: true,
    },
  );

  return sortedParticipants as Ref<Participant[]>;
}
