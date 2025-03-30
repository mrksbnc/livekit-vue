import { useEnsureParticipant } from '@/context/participant.context';
import { createIsSpeakingObserver } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';

export type UseIsSpeaking = {
  isSpeaking: Ref<boolean>;
};

export type UseIsSpeakingProps = {
  participant: Participant;
};

export function useIsSpeaking(props: UseIsSpeakingProps): UseIsSpeaking {
  const p = useEnsureParticipant(props.participant);

  const isSpeaking = ref<boolean>(p.value.isSpeaking || false);

  const observable = computed<ReturnType<typeof createIsSpeakingObserver>>(() =>
    createIsSpeakingObserver(p.value),
  );

  watchEffect((onCleanup): void => {
    const subscription = observable.value.subscribe({
      next: (speaking: boolean): void => {
        isSpeaking.value = speaking;
      },
      error: (err: Error): void => {
        console.error('Speaking state observer error:', err);
      },
    });

    onCleanup((): void => {
      subscription.unsubscribe();
    });
  });

  return { isSpeaking };
}
