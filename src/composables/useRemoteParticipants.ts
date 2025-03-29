import { useEnsureRoomContext } from '@/context/room.context';
import { connectedParticipantsObserver } from '@livekit/components-core';
import type { Participant, Room, RoomEvent } from 'livekit-client';
import { shallowRef, watchEffect, type ShallowRef } from 'vue';

export type UseRemoteParticipantsProps = {
  updateOnlyOn?: RoomEvent[];
  room?: Room;
};

export type UseRemoteParticipants = {
  participants: ShallowRef<Participant[]>;
};

export function useRemoteParticipants(
  props: UseRemoteParticipantsProps = {},
): UseRemoteParticipants {
  const room = useEnsureRoomContext(props.room);
  const participants = shallowRef<Participant[]>([]);

  watchEffect((onCleanup) => {
    if (!room.value) {
      participants.value = [];
      return;
    }

    const observable = connectedParticipantsObserver(room.value, {
      additionalRoomEvents: props.updateOnlyOn,
    });

    const subscription = observable.subscribe({
      next: (participantList) => {
        participants.value = participantList;
      },
      error: (err) => {
        console.error('Error in remote participants observer:', err);
        participants.value = [];
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return { participants };
}
