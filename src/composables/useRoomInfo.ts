import { useEnsureRoomContext } from '@/context/room.context';
import { roomInfoObserver } from '@livekit/components-core';
import { useObservable } from '@vueuse/rxjs';
import type { Room } from 'livekit-client';
import type { Observable } from 'rxjs';
import { toRefs } from 'vue';
import { useObservableState } from './private/useObservableState';

export type UseRoomInfoOptions = {
  room?: Room;
};

export type RoomInfo = {
  name: string;
  metadata: string;
};

export function useRoomInfo(options: UseRoomInfoOptions = {}) {
  const room = useEnsureRoomContext(options.room);

  const infoObserver = useObservable(
    roomInfoObserver(room.value) as unknown as Observable<RoomInfo>,
  );

  const info = useObservableState({
    observable: infoObserver.value as unknown as Observable<RoomInfo>,
    startWith: {
      name: room.value.name,
      metadata: room.value.metadata,
    },
  });

  const { name, metadata } = toRefs(info.value);

  return {
    name,
    metadata,
  };
}
