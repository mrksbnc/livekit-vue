import { useMaybeParticipantContext } from '@/context';
import { participantInfoObserver } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { ref, shallowRef, watchEffect, type Ref } from 'vue';

export type UseParticipantInfoProps = {
  participant?: Participant;
};

export type ParticipantInfo = {
  name: string | undefined;
  identity: string;
  metadata: string | undefined;
};

export type UseParticipantInfo = {
  info: Ref<ParticipantInfo | undefined>;
};

export function useParticipantInfo(props: UseParticipantInfoProps = {}): UseParticipantInfo {
  const contextParticipant = useMaybeParticipantContext();
  const participant = props.participant ? shallowRef(props.participant) : contextParticipant;

  const info = ref<ParticipantInfo | undefined>(
    participant?.value
      ? {
          name: participant.value.name,
          identity: participant.value.identity,
          metadata: participant.value.metadata,
        }
      : undefined,
  );

  watchEffect((onCleanup) => {
    if (!participant?.value) {
      return;
    }

    const observer = participantInfoObserver(participant.value);
    if (!observer) {
      return;
    }

    const subscription = observer.subscribe({
      next: (newInfo) => {
        info.value = newInfo;
      },
      error: (err) => {
        console.error('Error in participant info observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return { info };
}
