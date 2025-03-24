import { useEnsureRoomContext } from '@/context/room.context';
import {
  connectedParticipantObserver,
  participantByIdentifierObserver,
  type ParticipantIdentifier,
} from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { ParticipantEvent, RemoteParticipant, Room } from 'livekit-client';
import { computed, ref, shallowRef, type Ref } from 'vue';

export type UseRemoteParticipantOptions = {
  updateOnlyOn?: ParticipantEvent[];
};

export type UseRemoteParticipantArgs = {
  identityOrIdentifier: string | ParticipantIdentifier;
  options: UseRemoteParticipantOptions;
};

export type UseRemoteParticipant = {
  participant: Ref<RemoteParticipant | undefined>;
};

export function useRemoteParticipant(args: UseRemoteParticipantArgs): UseRemoteParticipant {
  const room: Ref<Room> = useEnsureRoomContext();
  const updateOnlyOn: Ref<ParticipantEvent[]> = ref(args.options.updateOnlyOn ?? []);
  const participant: Ref<RemoteParticipant | undefined> = shallowRef(undefined);

  const observable = computed(() => {
    if (typeof args.identityOrIdentifier === 'string') {
      return connectedParticipantObserver(room.value, args.identityOrIdentifier, {
        additionalEvents: updateOnlyOn.value,
      });
    } else {
      return participantByIdentifierObserver(room.value, args.identityOrIdentifier, {
        additionalEvents: updateOnlyOn.value,
      });
    }
  });

  useSubscription(
    observable.value.subscribe((p) => {
      participant.value = p;
    }),
  );

  return { participant };
}
