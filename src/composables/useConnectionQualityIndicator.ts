import { useEnsureParticipant } from '@/context/participant.context';
import { setupConnectionQualityIndicator } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import { ConnectionQuality, type Participant } from 'livekit-client';
import { computed, ref, toRefs, type ShallowRef } from 'vue';

export type ConnectionQualityIndicatorOptions = {
  participant?: Participant;
};

export type ConnectionQualityIndicatorReturnType = {
  className: ShallowRef<string>;
  quality: ShallowRef<ConnectionQuality>;
};

export function useConnectionQualityIndicator(
  options: ConnectionQualityIndicatorOptions = {},
): ConnectionQualityIndicatorReturnType {
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
