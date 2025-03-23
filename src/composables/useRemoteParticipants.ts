import { useEnsureRoom } from '@/context/room.context';
import { connectedParticipantsObserver } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant, Room, RoomEvent } from 'livekit-client';
import { ref, watch, type Ref } from 'vue';

export type UseRemoteParticipantsOptions = {
  updateOnlyOn?: RoomEvent[];
  room?: Room;
};

export function useRemoteParticipants(
  options: UseRemoteParticipantsOptions = {},
): Ref<Participant[]> {
  const room = useEnsureRoom(options.room);
  const participants = ref<Participant[]>([]);

  watch([room, options.updateOnlyOn], () => {
    useSubscription(
      connectedParticipantsObserver(room.value, {
        additionalRoomEvents: options.updateOnlyOn,
      }).subscribe((v) => (participants.value = v)),
    );
  });

  return participants as Ref<Participant[]>;
}
