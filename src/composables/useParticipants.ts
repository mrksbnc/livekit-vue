import type { Room, RoomEvent } from 'livekit-client';
import { useRemoteParticipants } from './useRemoteParticipants';

export type UseParticipantsOptions = {
  updateOnlyOn?: RoomEvent[];
  room?: Room;
};

export function useParticipants(options: UseParticipantsOptions = {}) {
  const remoteParticipants = useRemoteParticipants(options);
  const participants = remoteParticipants.value;
}
