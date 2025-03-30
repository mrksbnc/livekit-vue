import { useEnsureParticipant } from '@/context/participant.context';
import { useEnsureRoomContext } from '@/context/room.context';
import { encryptionStatusObservable } from '@livekit/components-core';
import type { LocalParticipant, Participant, Room } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';

export type UseIsEncryptedProps = {
  room?: Room;
  participant?: Participant;
};

export type UseIsEncrypted = {
  isEncrypted: Ref<boolean>;
};

export function useIsEncrypted(props: UseIsEncryptedProps): UseIsEncrypted {
  const room = useEnsureRoomContext(props.room);
  const participant = useEnsureParticipant(props.participant);

  const isEncrypted = ref<boolean>(
    participant.value.isLocal
      ? (participant.value as LocalParticipant).isE2EEEnabled
      : !!participant.value?.isEncrypted,
  );

  const observable = computed<ReturnType<typeof encryptionStatusObservable>>(() =>
    encryptionStatusObservable(room.value, participant.value),
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
