import { useEnsureRoomContext } from '@/context/room.context';
import { connectionStateObserver } from '@livekit/components-core';
import { ConnectionState, type Room } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';

export type ConnectionStateProps = {
  room?: Room;
};

export type UseConnectionState = {
  connectionState: Ref<ConnectionState>;
};

export function useConnectionState(props: ConnectionStateProps = {}): UseConnectionState {
  const roomEnsured = useEnsureRoomContext(props.room);
  const connectionState = ref<ConnectionState>(
    roomEnsured.value?.state || ConnectionState.Disconnected,
  );

  const observable = computed<ReturnType<typeof connectionStateObserver>>(() =>
    connectionStateObserver(roomEnsured.value),
  );

  watchEffect((onCleanup): void => {
    const currentRoom = roomEnsured.value;
    if (!currentRoom) {
      return;
    }

    const subscription = observable.value.subscribe({
      next: (state: ConnectionState): void => {
        connectionState.value = state;
      },
      error: (err: Error): void => {
        console.error('Connection state observer error:', err);
      },
    });

    onCleanup((): void => {
      subscription.unsubscribe();
    });
  });

  return { connectionState };
}
