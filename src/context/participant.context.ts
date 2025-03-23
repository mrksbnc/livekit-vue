import { createInjectionState } from '@vueuse/core';
import type { Participant } from 'livekit-client';
import { shallowRef, type ShallowRef } from 'vue';

export type ParticipantContext = {
  participant: Participant;
};

const [useProvideParticipantContext, useParticipantContext] = createInjectionState(
  (initialValue: Participant): Readonly<ShallowRef<Participant>> => {
    const participant = shallowRef(initialValue);

    return participant;
  },
);

export function useMaybeParticipantContext(): Readonly<ShallowRef<Participant>> | undefined {
  return useParticipantContext();
}

export function useEnsureParticipant(participant?: Participant): Readonly<ShallowRef<Participant>> {
  const r = participant ? shallowRef(participant) : useParticipantContext();

  if (!r || !r.value) {
    throw new Error(
      'Please call `useProvideParticipantContext` on the appropriate parent component',
    );
  }

  return r;
}

export { useParticipantContext, useProvideParticipantContext };
