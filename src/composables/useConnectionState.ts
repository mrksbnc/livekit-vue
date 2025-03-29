import { useConnectionStateContext } from '@/context/connection_state.context';
import { useEnsureRoomContext } from '@/context/room.context';
import { connectionStateObserver } from '@livekit/components-core';
import { ConnectionState, type Room } from 'livekit-client';
import { computed, watchEffect, type ComputedRef, type Ref } from 'vue';

export type ConnectionStateProps = {
  room?: Room;
};

export type UseConnectionState = {
  connectionState: Ref<ConnectionState>;
  isConnecting: ComputedRef<boolean>;
  isConnected: ComputedRef<boolean>;
  isReconnecting: ComputedRef<boolean>;
  isDisconnected: ComputedRef<boolean>;
};

export function useConnectionState(props: ConnectionStateProps = {}): UseConnectionState {
  const roomEnsured = useEnsureRoomContext(props.room);
  const connectionStateContext = useConnectionStateContext();

  const observable = computed<ReturnType<typeof connectionStateObserver>>(() =>
    connectionStateObserver(roomEnsured.value),
  );

  watchEffect((onCleanup): void => {
    const currentRoom = roomEnsured.value;
    if (!currentRoom) {
      return;
    }

    // Initialize with current state
    connectionStateContext.setConnectionState(currentRoom.state || ConnectionState.Disconnected);

    const subscription = observable.value.subscribe({
      next: (state: ConnectionState): void => {
        connectionStateContext.setConnectionState(state);
      },
      error: (err: Error): void => {
        console.error('Connection state observer error:', err);
      },
    });

    onCleanup((): void => {
      subscription.unsubscribe();
    });
  });

  return {
    connectionState: connectionStateContext.state.connectionState,
    isConnecting: connectionStateContext.isConnecting,
    isConnected: connectionStateContext.isConnected,
    isReconnecting: connectionStateContext.isReconnecting,
    isDisconnected: connectionStateContext.isDisconnected,
  };
}
