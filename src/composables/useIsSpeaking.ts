import { useEnsureParticipant } from '@/context/participant.context';
import { createIsSpeakingObserver } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed } from 'vue';
import { useObservableState } from './private/useObservableState';

export function useIsSpeaking(participant?: Participant) {
  const p = useEnsureParticipant(participant);

  const observable = computed<Observable<boolean>>(
    () => createIsSpeakingObserver(p.value) as unknown as Observable<boolean>,
  );

  const isSpeaking = useObservableState({
    observable: observable.value as unknown as Observable<boolean>,
    startWith: p.value.isSpeaking,
  });

  return isSpeaking;
}
