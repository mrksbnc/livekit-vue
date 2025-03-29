import { useEnsureRoomContext } from '@/context/room.context';
import { connectedParticipantsObserver } from '@livekit/components-core';
import type { Participant, Room, RoomEvent } from 'livekit-client';
import { shallowRef, watchEffect, type ShallowRef } from 'vue';

export type UseRemoteParticipantsOptions = {
  updateOnlyOn?: RoomEvent[];
  room?: Room;
};

export type UseRemoteParticipants = {
  participants: ShallowRef<Participant[]>;
};

export function useRemoteParticipants(
  options: UseRemoteParticipantsOptions = {},
): UseRemoteParticipants {
  const room = useEnsureRoomContext(options.room);
  const participants = shallowRef<Participant[]>([]);

  watchEffect((onCleanup) => {
    if (!room.value) {
      participants.value = [];
      return;
    }

    const observable = connectedParticipantsObserver(room.value, {
      additionalRoomEvents: options.updateOnlyOn,
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
