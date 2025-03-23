import type { LocalParticipant, RemoteParticipant, Room, RoomEvent } from 'livekit-client';
import { computed, type ShallowRef } from 'vue';
import { useLocalParticipant } from './useLocalParticipant';
import { useRemoteParticipants } from './useRemoteParticipants';

export type UseParticipantsOptions = {
  updateOnlyOn?: RoomEvent[];
  room?: Room;
};

export function useParticipants(
  options: UseParticipantsOptions = {},
): ShallowRef<(RemoteParticipant | LocalParticipant)[]> {
  const remoteParticipants = useRemoteParticipants(options);
  const localParticipant = useLocalParticipant()?.localParticipant;

  const participants = computed<(RemoteParticipant | LocalParticipant)[]>(() => {
    return [localParticipant.value, ...remoteParticipants.value] as (
      | RemoteParticipant
      | LocalParticipant
    )[];
  });

  return participants;
}
