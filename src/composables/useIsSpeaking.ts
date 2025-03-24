import { useEnsureParticipant } from '@/context/participant.context';
import { createIsSpeakingObserver } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant } from 'livekit-client';
import type { Observable } from 'rxjs';
import { ref, type ShallowRef } from 'vue';

export type IsSpeakingObservable = Observable<boolean>;

export function useIsSpeaking(participant?: Participant): ShallowRef<boolean> {
  const p = useEnsureParticipant(participant);

  const isSpeaking = ref<boolean>(false);

  useSubscription(
    createIsSpeakingObserver(p.value).subscribe((speaking) => {
      isSpeaking.value = speaking;
    }),
  );

  return isSpeaking;
}
