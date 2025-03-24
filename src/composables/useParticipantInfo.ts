import { useMaybeParticipantContext } from '@/context';
import { participantInfoObserver } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, onMounted, ref, type Ref } from 'vue';

export type UseParticipantInfoOptions = {
  participant?: Participant;
};

export type ParticipantInfo = {
  name: string | undefined;
  identity: string;
  metadata: string | undefined;
};

export type ParticipantInfoObservable = Observable<ParticipantInfo>;

export type UseParticipantInfo = {
  info: Ref<ParticipantInfo | undefined>;
};

export function useParticipantInfo(props: UseParticipantInfoOptions = {}): UseParticipantInfo {
  const p = useMaybeParticipantContext();

  const data = ref<ParticipantInfo | undefined>(undefined);

  const infoObserver = computed<ParticipantInfoObservable>(
    () => participantInfoObserver(p?.value) as unknown as ParticipantInfoObservable,
  );

  useSubscription(
    infoObserver.value?.subscribe((info) => {
      data.value = info;
    }),
  );

  onMounted(() => {
    if (props.participant && p && p.value) {
      p.value = props.participant;
    }
  });

  return { info: data };
}
