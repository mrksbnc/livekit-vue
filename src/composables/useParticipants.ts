import type { LocalParticipant, RemoteParticipant, Room, RoomEvent } from 'livekit-client';
import { computed, type Ref } from 'vue';
import { useLocalParticipant } from './useLocalParticipant';
import { useRemoteParticipants } from './useRemoteParticipants';

export type UseParticipantsOptions = {
  updateOnlyOn?: RoomEvent[];
  room?: Room;
};

export type UseParticipants = {
  participants: Ref<MixedParticipantArray>;
};

export type MixedParticipantArray = (RemoteParticipant | LocalParticipant)[];

export function useParticipants(options: UseParticipantsOptions = {}): UseParticipants {
  const { participants } = useRemoteParticipants({
    options,
  });
  const localParticipant = useLocalParticipant()?.localParticipant;

  const p = computed<(RemoteParticipant | LocalParticipant)[]>(() => {
    return [localParticipant.value, ...participants.value] as MixedParticipantArray;
  });

  return { participants: p };
}
