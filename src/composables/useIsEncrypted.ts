import { useEnsureParticipant } from '@/context/participant.context';
import { useEnsureRoomContext } from '@/context/room.context';
import { encryptionStatusObservable } from '@livekit/components-core';
import type { LocalParticipant, Participant, Room } from 'livekit-client';
import { Observable } from 'rxjs';
import { ref, type ShallowRef } from 'vue';
import { useObservableState } from './private/useObservableState';

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

  const observer = ref<EncryptedObservable>(
    encryptionStatusObservable(room.value, p.value) as unknown as EncryptedObservable,
  );

  const isEncrypted = useObservableState({
    observable: observer.value as unknown as EncryptedObservable,
    startWith: p.value.isLocal
      ? (p.value as LocalParticipant).isE2EEEnabled
      : !!p.value?.isEncrypted,
  });

  return isEncrypted;
}
