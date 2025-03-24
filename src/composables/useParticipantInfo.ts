import { useMaybeParticipantContext } from '@/context';
import { participantInfoObserver } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, onMounted, ref, type ShallowRef } from 'vue';

export type UseParticipantInfoOptions = {
  participant?: Participant;
};

export type ParticipantInfo = {
  name: string | undefined;
  identity: string;
  metadata: string | undefined;
};

export function useParticipantInfo(
  props: UseParticipantInfoOptions = {},
): ShallowRef<ParticipantInfo | undefined> {
  const p = useMaybeParticipantContext();

  const data = ref<
    | {
        name: string | undefined;
        identity: string;
        metadata: string | undefined;
      }
    | undefined
  >(undefined);

  const infoObserver = computed<Observable<ParticipantInfo>>(
    () => participantInfoObserver(p?.value) as unknown as Observable<ParticipantInfo>,
  );

  useSubscription(
    infoObserver.value?.subscribe((info) => {
      data.value = info;
    }),
  );

  onMounted(() => {
    if (props.participant && p) {
      p.value = props.participant;
    }
  });

  return data;
}
