import { useEnsureParticipant } from '@/context/participant.context';
import { useEnsureRoomContext } from '@/context/room.context';
import { encryptionStatusObservable } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { LocalParticipant, Participant, Room } from 'livekit-client';
import { Observable } from 'rxjs';
import { ref, type ShallowRef } from 'vue';

export type UseIsEncryptedOptions = {
  room?: Room;
};

export type EncryptedObservable = Observable<boolean>;

export function useIsEncrypted(
  participant?: Participant,
  options: UseIsEncryptedOptions = {},
): ShallowRef<boolean> {
  const p = useEnsureParticipant(participant);
  const room = useEnsureRoomContext(options.room);
  const isEncrypted = ref<boolean>(
    p.value.isLocal ? (p.value as LocalParticipant).isE2EEEnabled : !!p.value?.isEncrypted,
  );

  useSubscription(
    encryptionStatusObservable(room.value, p.value).subscribe((encrypted) => {
      isEncrypted.value = encrypted;
    }),
  );

  return isEncrypted;
}
