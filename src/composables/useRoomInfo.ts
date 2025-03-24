import { useEnsureRoomContext } from '@/context/room.context';
import { roomInfoObserver } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Room } from 'livekit-client';
import { ref, type Ref } from 'vue';

export type UseRoomInfoOptions = {
  room?: Room;
};

export type RoomInfo = {
  name: string;
  metadata: string | undefined;
};

export type UseRoomInfo = {
  info: Ref<RoomInfo>;
};

export function useRoomInfo(options: UseRoomInfoOptions = {}): UseRoomInfo {
  const room = useEnsureRoomContext(options.room);

  const info = ref<RoomInfo>({
    name: room.value.name,
    metadata: room.value.metadata,
  });

  useSubscription(
    roomInfoObserver(room.value).subscribe((inf) => {
      info.value = inf;
    }),
  );

  return {
    info,
  };
}
