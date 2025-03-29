import type { LocalParticipant, RemoteParticipant, Room, RoomEvent } from 'livekit-client';
import { computed, type ComputedRef } from 'vue';
import { useLocalParticipant } from './useLocalParticipant';
import { useRemoteParticipants } from './useRemoteParticipants';

export type UseParticipantsOptions = {
  updateOnlyOn?: RoomEvent[];
  room?: Room;
};

export type MixedParticipantArray = (RemoteParticipant | LocalParticipant)[];

export type UseParticipants = {
  participants: ComputedRef<MixedParticipantArray>;
};

export function useParticipants(options: UseParticipantsOptions = {}): UseParticipants {
  const { participants: remoteParticipants } = useRemoteParticipants({
    updateOnlyOn: options.updateOnlyOn,
    room: options.room,
  });

  const { localParticipant } = useLocalParticipant({
    room: options.room,
  });

  const participants = computed<MixedParticipantArray>(() => {
    const result: MixedParticipantArray = [];

    if (localParticipant.value) {
      result.push(localParticipant.value as LocalParticipant);
    }

    if (remoteParticipants.value?.length) {
      result.push(...(remoteParticipants.value as RemoteParticipant[]));
    }

    return result;
  });

  return { participants };
}
