import { sortParticipants } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { shallowRef, watchEffect, type ShallowRef } from 'vue';
import { useSpeakingParticipants } from './useSpeakingParticipants';

export type UseSortedParticipants = {
  sortedParticipants: ShallowRef<Participant[]>;
};

export type UseSortedParticipantsProps = {
  participants: Participant[];
};

export function useSortedParticipants(props: UseSortedParticipantsProps): UseSortedParticipants {
  const { activeSpeakers } = useSpeakingParticipants();

  const sortedParticipants = shallowRef<Participant[]>(
    sortParticipants([...props.participants, ...activeSpeakers.value]),
  );

  watchEffect(() => {
    if (!props.participants || props.participants.length === 0) {
      sortedParticipants.value = [];
      return;
    }

    sortedParticipants.value = sortParticipants(props.participants);
  });

  return { sortedParticipants };
}
