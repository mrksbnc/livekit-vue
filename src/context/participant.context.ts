import { createInjectionState } from '@vueuse/core';
import type { Participant } from 'livekit-client';
import { shallowRef, type ShallowRef } from 'vue';
import { MissingContextError } from './error';

export type ParticipantContext = ShallowRef<Participant>;

const [useProvideParticipantContext, useParticipantContextRaw] = createInjectionState(
  (initialValue: Participant): ParticipantContext => {
    return shallowRef(initialValue);
  },
);

export { useParticipantContextRaw, useProvideParticipantContext };

export function useMaybeParticipantContext(): ParticipantContext | undefined {
  return useParticipantContextRaw();
}

export function useParticipantContext(): ParticipantContext {
  const context = useMaybeParticipantContext();

  if (!context) {
    throw new MissingContextError(
      'Please call `useProvideParticipantContext` on the appropriate parent component',
    );
  }

  return context;
}

export function useEnsureParticipant(participant?: Participant): ParticipantContext {
  if (participant) {
    return shallowRef(participant);
  }

  return useParticipantContext();
}
