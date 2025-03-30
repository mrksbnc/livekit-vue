import type { LocalParticipant, RemoteParticipant, Room, RoomEvent } from 'livekit-client';
import { computed, type ComputedRef } from 'vue';
import { useLocalParticipant } from './useLocalParticipant';
import { useRemoteParticipants } from './useRemoteParticipants';

export type UseParticipantsProps = {
  updateOnlyOn?: RoomEvent[];
  room?: Room;
};

export type MixedParticipantArray = (RemoteParticipant | LocalParticipant)[];

export type UseParticipants = {
  participants: ComputedRef<MixedParticipantArray>;
};

export function useParticipants(props: UseParticipantsProps = {}): UseParticipants {
  const { participants: remoteParticipants } = useRemoteParticipants({
    updateOnlyOn: props.updateOnlyOn,
    room: props.room,
  });

  const { localParticipant } = useLocalParticipant({
    room: props.room,
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
