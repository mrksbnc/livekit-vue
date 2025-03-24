import { useEnsureParticipant } from '@/context/participant.context';
import { useEnsureRoomContext } from '@/context/room.context';
import { encryptionStatusObservable } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { LocalParticipant, Participant, Room } from 'livekit-client';
import { Observable } from 'rxjs';
import { ref, type Ref } from 'vue';

export type EncryptedObservable = Observable<boolean>;

export type UseIsEncryptedOptions = {
  room?: Room;
};

export type UseIsEncryptedArgs = {
  participant?: Participant;
  options?: UseIsEncryptedOptions;
};

export type UseIsEncrypted = {
  isEncrypted: Ref<boolean>;
};

export function useIsEncrypted(args: UseIsEncryptedArgs): UseIsEncrypted {
  const p = useEnsureParticipant(args.participant);
  const room = useEnsureRoomContext(args.options?.room);

  const isEncrypted = ref<boolean>(
    p.value.isLocal ? (p.value as LocalParticipant).isE2EEEnabled : !!p.value?.isEncrypted,
  );

  useSubscription(
    encryptionStatusObservable(room.value, p.value).subscribe((encrypted) => {
      isEncrypted.value = encrypted;
    }),
  );

  return { isEncrypted };
}
