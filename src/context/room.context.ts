import { createInjectionState } from '@vueuse/core';
import type { Room } from 'livekit-client';
import { shallowRef, type ShallowRef } from 'vue';

export type RoomContext = {
  room: Room;
};

const [useProvideRoomContext, useRoomContext] = createInjectionState(
  (initialValue: Room): Readonly<ShallowRef<Room>> => {
    const room = shallowRef(initialValue);

    return room;
  },
);

export function useMaybeRoomContext(): Readonly<ShallowRef<Room>> | undefined {
  return useRoomContext();
}

export function useEnsureRoom(room?: Room): Readonly<ShallowRef<Room>> {
  const r = room ? shallowRef(room) : useRoomContext();

  if (!r || !r.value) {
    throw new Error('Please call `useProvideRoomContext` on the appropriate parent component');
  }

  return r;
}

export { useProvideRoomContext, useRoomContext };
