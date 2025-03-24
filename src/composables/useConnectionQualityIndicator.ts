import { useEnsureParticipant } from '@/context/participant.context';
import { setupConnectionQualityIndicator } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import { ConnectionQuality, type Participant } from 'livekit-client';
import { computed, ref, toRefs, type Ref } from 'vue';

export type ConnectionQualityIndicatorOptions = {
  participant?: Participant;
};

export type UseConnectionQualityIndicator = {
  className: Ref<string>;
  quality: Ref<ConnectionQuality>;
};

export function useConnectionQualityIndicator(
  options: ConnectionQualityIndicatorOptions = {},
): UseConnectionQualityIndicator {
  const p = useEnsureParticipant(options.participant);

  const quality = ref<ConnectionQuality>(ConnectionQuality.Unknown);

  const setupConnectionQualityIndicatorResult = computed(() =>
    setupConnectionQualityIndicator(p.value),
  );

  const { className, connectionQualityObserver } = toRefs(
    setupConnectionQualityIndicatorResult.value,
  );

  useSubscription(
    connectionQualityObserver.value.subscribe((q) => {
      quality.value = q;
    }),
  );

  return {
    className,
    quality,
  };
}
