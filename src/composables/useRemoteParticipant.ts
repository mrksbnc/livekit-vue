import { useEnsureRoomContext } from '@/context/room.context';
import {
  connectedParticipantObserver,
  participantByIdentifierObserver,
  type ParticipantIdentifier,
} from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { ParticipantEvent, RemoteParticipant, Room } from 'livekit-client';
import { computed, ref, type Ref } from 'vue';

export type UseRemoteParticipantOptions = {
  updateOnlyOn?: ParticipantEvent[];
};

export function useRemoteParticipant(
  identityOrIdentifier: string | ParticipantIdentifier,
  options: UseRemoteParticipantOptions = {},
) {
  const room: Ref<Room> = useEnsureRoomContext();
  const updateOnlyOn: Ref<ParticipantEvent[]> = ref(options.updateOnlyOn ?? []);
  const participant: Ref<RemoteParticipant | undefined> = ref(undefined);

  const observable = computed(() => {
    if (typeof identityOrIdentifier === 'string') {
      return connectedParticipantObserver(room.value, identityOrIdentifier, {
        additionalEvents: updateOnlyOn.value,
      });
    } else {
      return participantByIdentifierObserver(room.value, identityOrIdentifier, {
        additionalEvents: updateOnlyOn.value,
      });
    }
  });

  useSubscription(
    observable.value.subscribe((p) => {
      participant.value = p;
    }),
  );

  return {
    participant: participant as Ref<RemoteParticipant | undefined>,
  };
}
