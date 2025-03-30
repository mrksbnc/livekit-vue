import { useEnsureParticipant } from '@/context/participant.context';
import { setupConnectionQualityIndicator } from '@livekit/components-core';
import { ConnectionQuality, type Participant } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';

export type ConnectionQualityIndicatorProps = {
  participant?: Participant;
};

export type UseConnectionQualityIndicator = {
  quality: Ref<ConnectionQuality>;
};

export function useConnectionQualityIndicator(
  props: ConnectionQualityIndicatorProps = {},
): UseConnectionQualityIndicator {
  const participant = useEnsureParticipant(props.participant);
  const quality = ref<ConnectionQuality>(ConnectionQuality.Unknown);

  const setup = computed<ReturnType<typeof setupConnectionQualityIndicator>>(() =>
    setupConnectionQualityIndicator(participant.value),
  );

  watchEffect((onCleanup): void => {
    const currentParticipant = participant.value;
    if (!currentParticipant) {
      return;
    }

    const subscription = setup.value.connectionQualityObserver.subscribe({
      next: (q: ConnectionQuality): void => {
        quality.value = q;
      },
      error: (err: Error): void => {
        console.error('Connection quality observer error:', err);
      },
    });

    onCleanup((): void => {
      subscription.unsubscribe();
    });
  });

  return {
    quality,
  };
}
