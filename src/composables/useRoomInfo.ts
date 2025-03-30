import { useEnsureRoomContext } from '@/context/room.context';
import { roomInfoObserver } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { ref, watchEffect, type Ref } from 'vue';

export type UseRoomInfoProps = {
  room?: Room;
};

export type RoomInfo = {
  name: string;
  metadata: string | undefined;
};

export type UseRoomInfo = {
  info: Ref<RoomInfo>;
};

export function useRoomInfo(props: UseRoomInfoProps = {}): UseRoomInfo {
  const room = useEnsureRoomContext(props.room);

  const info = ref<RoomInfo>({
    name: room.value?.name ?? '',
    metadata: room.value?.metadata,
  });

  watchEffect((onCleanup) => {
    if (!room.value) {
      return;
    }

    const observable = roomInfoObserver(room.value);

    const subscription = observable.subscribe({
      next: (roomInfo) => {
        info.value = roomInfo;
      },
      error: (err) => {
        console.error('Error in room info observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return { info };
}
