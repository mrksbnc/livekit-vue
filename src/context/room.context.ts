import { createInjectionState } from '@vueuse/core';
import type { Room } from 'livekit-client';
import { shallowRef, type ShallowRef } from 'vue';
import { NoContextDataProvidedError } from './error';

export type RoomContext = ShallowRef<Room>;

const [useProvideRoomContext, useRoomContextRaw] = createInjectionState(
  (initialValue: Room): RoomContext => {
    return shallowRef(initialValue);
  },
);

export { useProvideRoomContext, useRoomContextRaw };

export function useMaybeRoomContext(): RoomContext | undefined {
  return useRoomContextRaw();
}

export function useRoomContext(): RoomContext {
  const context = useMaybeRoomContext();

  if (!context) {
    throw new NoContextDataProvidedError(
      'Please call `useProvideRoomContext` on the appropriate parent component',
    );
  }

  return context;
}

export function useEnsureRoomContext(room?: Room): RoomContext {
  if (room) {
    return shallowRef(room);
  }

  return useRoomContext();
}
