import { useEnsureRoomContext } from '@/context/room.context';
import { connectedParticipantsObserver } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant, Room, RoomEvent } from 'livekit-client';
import { shallowRef, watch, type ShallowRef } from 'vue';

export type UseRemoteParticipantsOptions = {
  updateOnlyOn?: RoomEvent[];
  room?: Room;
};

export type UseRemoteParticipants = {
  participants: ShallowRef<Participant[]>;
};

export type UseRemoteParticipantsArgs = {
  options: UseRemoteParticipantsOptions;
};

export function useRemoteParticipants(args: UseRemoteParticipantsArgs): UseRemoteParticipants {
  const room = useEnsureRoomContext(args.options.room);
  const participants = shallowRef<Participant[]>([]);

  watch([room, args.options.updateOnlyOn], () => {
    useSubscription(
      connectedParticipantsObserver(room.value, {
        additionalRoomEvents: args.options.updateOnlyOn,
      }).subscribe((v) => (participants.value = v)),
    );
  });

  return {
    participants,
  };
}
