import { createInjectionState } from '@vueuse/core';
import type { Room } from 'livekit-client';
import { shallowRef, type ShallowRef } from 'vue';
import { NoContextDataProvidedError } from './error';

export type RoomContext = {
  room: Room;
};

const [useProvideRoomContext, useRoomContext] = createInjectionState(
  (initialValue: Room): ShallowRef<Room> => {
    const room = shallowRef(initialValue);

    return room;
  },
);

export function useMaybeRoomContext(): ShallowRef<Room> | undefined {
  return useRoomContext();
}

export function useEnsureRoomContext(room?: Room): ShallowRef<Room> {
  const r = room ? shallowRef(room) : useRoomContext();

  if (!r || !r.value) {
    throw new NoContextDataProvidedError(
      'Please call `useProvideRoomContext` on the appropriate parent component',
    );
  }

  return r;
}

export { useProvideRoomContext, useRoomContext };
