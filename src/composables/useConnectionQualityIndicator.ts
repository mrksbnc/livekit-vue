import { useEnsureParticipant } from '@/context/participant.context';
import { setupConnectionQualityIndicator } from '@livekit/components-core';
import { ConnectionQuality, type Participant } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, toRefs, type ShallowRef } from 'vue';
import { useObservableState } from './private/useObservableState';

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

  const setupConnectionQualityIndicatorResult = computed(() =>
    setupConnectionQualityIndicator(p.value),
  );

  const { className, connectionQualityObserver } = toRefs(
    setupConnectionQualityIndicatorResult.value,
  );

  const quality = useObservableState({
    observable: connectionQualityObserver.value as unknown as Observable<ConnectionQuality>,
    startWith: ConnectionQuality.Unknown,
  });

  return {
    className,
    quality,
  };
}
