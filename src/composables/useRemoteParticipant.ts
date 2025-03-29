import { useEnsureRoomContext } from '@/context/room.context';
import {
  connectedParticipantObserver,
  participantByIdentifierObserver,
  type ParticipantIdentifier,
} from '@livekit/components-core';
import type { ParticipantEvent, RemoteParticipant } from 'livekit-client';
import { computed, shallowRef, watchEffect, type Ref } from 'vue';

export type UseRemoteParticipantOptions = {
  updateOnlyOn?: ParticipantEvent[];
};

export type UseRemoteParticipant = {
  participant: Ref<RemoteParticipant | undefined>;
};

export function useRemoteParticipant(
  identityOrIdentifier: string | ParticipantIdentifier,
  options: UseRemoteParticipantOptions = {},
): UseRemoteParticipant {
  const room = useEnsureRoomContext();
  const participant = shallowRef<RemoteParticipant | undefined>(undefined);

  const observable = computed<
    | ReturnType<typeof connectedParticipantObserver>
    | ReturnType<typeof participantByIdentifierObserver>
    | null
  >(() => {
    if (!room.value) {
      return null;
    }

    const additionalEvents = options.updateOnlyOn || [];

    return typeof identityOrIdentifier === 'string'
      ? connectedParticipantObserver(room.value, identityOrIdentifier, {
          additionalEvents,
        })
      : participantByIdentifierObserver(room.value, identityOrIdentifier, {
          additionalEvents,
        });
  });

  watchEffect((onCleanup) => {
    const currentObservable = observable.value;
    if (!currentObservable) {
      return;
    }

    const subscription = currentObservable.subscribe({
      next: (p) => {
        participant.value = p;
      },
      error: (err) => {
        console.error('Error in remote participant observer:', err);
        participant.value = undefined;
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return { participant };
}
