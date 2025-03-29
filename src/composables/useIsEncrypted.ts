import { useEnsureParticipant } from '@/context/participant.context';
import { useEnsureRoomContext } from '@/context/room.context';
import { encryptionStatusObservable } from '@livekit/components-core';
import type { LocalParticipant, Participant, Room } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';

export type UseIsEncryptedOptions = {
  room?: Room;
};

export type UseIsEncrypted = {
  isEncrypted: Ref<boolean>;
};

export function useIsEncrypted(
  participant?: Participant,
  options: UseIsEncryptedOptions = {},
): UseIsEncrypted {
  const p = useEnsureParticipant(participant);
  const room = useEnsureRoomContext(options.room);

  const isEncrypted = ref<boolean>(
    p.value.isLocal ? (p.value as LocalParticipant).isE2EEEnabled : !!p.value?.isEncrypted,
  );

  const observable = computed<ReturnType<typeof encryptionStatusObservable>>(() =>
    encryptionStatusObservable(room.value, p.value),
  );

  watchEffect((onCleanup): void => {
    const subscription = observable.value.subscribe({
      next: (encrypted: boolean): void => {
        isEncrypted.value = encrypted;
      },
      error: (err: Error): void => {
        console.error('Encryption status observable error:', err);
      },
    });

    onCleanup((): void => {
      subscription.unsubscribe();
    });
  });

  return { isEncrypted };
}
