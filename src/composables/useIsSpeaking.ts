import { useEnsureParticipant } from '@/context/participant.context';
import { createIsSpeakingObserver } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, type ShallowRef } from 'vue';
import { useObservableState } from './private/useObservableState';

export type IsSpeakingObservable = Observable<boolean>;

export function useIsSpeaking(participant?: Participant): ShallowRef<boolean> {
  const p = useEnsureParticipant(participant);

  const observable = computed<IsSpeakingObservable>(
    () => createIsSpeakingObserver(p.value) as unknown as IsSpeakingObservable,
  );

  const isSpeaking = useObservableState({
    observable: observable.value as unknown as IsSpeakingObservable,
    startWith: p.value.isSpeaking,
  });

  return isSpeaking;
}
