import { useRoomContext } from '@/context/room.context';
import type { LiveKitRoomProps } from '@/types/livekit_room.types';
import { roomOptionsStringifyReplacer } from '@/utils/room.utils';
import { DisconnectReason, MediaDeviceFailure, Room, RoomEvent } from 'livekit-client';
import {
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  toRefs,
  watchEffect,
  type Ref,
  type ShallowRef,
} from 'vue';

export enum ConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Failed = 'failed',
}

export type UseLiveKitRoom = {
  room: ShallowRef<Room | undefined>;
  connectionState: Ref<ConnectionState>;
};

const defaultRoomProps: Partial<LiveKitRoomProps> = {
  connect: true,
  audio: false,
  video: false,
};

export function useLiveKitRoom(props: LiveKitRoomProps): UseLiveKitRoom {
  const {
    token,
    serverUrl,
    options,
    room: passedRoom,
    connectOptions,
    connect,
    audio,
    video,
    screen,
    onConnected,
    onDisconnected,
    onError,
    onMediaDeviceFailure,
    onEncryptionError,
    simulateParticipants,
  } = toRefs({ ...defaultRoomProps, ...props });

  const connectionState = ref<ConnectionState>(ConnectionState.Disconnected);
  const shouldConnect = ref<boolean>(connect?.value ?? false);
  const room = shallowRef<Room | undefined>(passedRoom?.value ?? useRoomContext()?.value);

  const setupEventHandlers = (r: Room): (() => void) => {
    const onSignalConnected = (): void => {
      const localP = r.localParticipant;
      if (!localP) return;

      console.debug('trying to publish local tracks');
      Promise.all([
        localP.setMicrophoneEnabled(
          !!audio?.value,
          typeof audio?.value !== 'boolean' ? audio?.value : undefined,
        ),
        localP.setCameraEnabled(
          !!video?.value,
          typeof video?.value !== 'boolean' ? video?.value : undefined,
        ),
        localP.setScreenShareEnabled(
          !!screen?.value,
          typeof screen?.value !== 'boolean' ? screen?.value : undefined,
        ),
      ]).catch((e: unknown) => {
        console.warn(e);
        onError?.value?.(e as Error);
      });
    };

    const handleMediaDeviceError = (e: Error): void => {
      onMediaDeviceFailure?.value?.(MediaDeviceFailure.getFailure(e));
    };

    const handleEncryptionError = (e: Error): void => {
      onEncryptionError?.value?.(e);
    };

    const handleDisconnected = (reason?: DisconnectReason): void => {
      connectionState.value = ConnectionState.Disconnected;
      onDisconnected?.value?.(reason);
    };

    const handleConnected = (): void => {
      connectionState.value = ConnectionState.Connected;
      onConnected?.value?.();
    };

    r.on(RoomEvent.SignalConnected, onSignalConnected)
      .on(RoomEvent.MediaDevicesError, handleMediaDeviceError)
      .on(RoomEvent.EncryptionError, handleEncryptionError)
      .on(RoomEvent.Disconnected, handleDisconnected)
      .on(RoomEvent.Connected, handleConnected);

    return (): void => {
      r.off(RoomEvent.SignalConnected, onSignalConnected)
        .off(RoomEvent.MediaDevicesError, handleMediaDeviceError)
        .off(RoomEvent.EncryptionError, handleEncryptionError)
        .off(RoomEvent.Disconnected, handleDisconnected)
        .off(RoomEvent.Connected, handleConnected);
    };
  };

  watchEffect((onCleanup) => {
    if (!room.value) {
      return;
    }

    const cleanup = setupEventHandlers(room.value);
    onCleanup(cleanup);
  });

  watchEffect((onCleanup) => {
    const currentRoom = room.value;
    if (!currentRoom) {
      return;
    }

    const effectState = { canceled: false };

    if (simulateParticipants?.value) {
      currentRoom.simulateParticipants({
        participants: {
          count: simulateParticipants.value,
        },
        publish: {
          audio: true,
          useRealTracks: true,
        },
      });
      return;
    }

    if (connect?.value) {
      shouldConnect.value = true;
      connectionState.value = ConnectionState.Connecting;
      console.debug('connecting');

      if (!token.value) {
        console.debug('no token yet');
        connectionState.value = ConnectionState.Failed;
        return;
      }

      if (!serverUrl.value) {
        console.warn('no livekit url provided');
        connectionState.value = ConnectionState.Failed;
        onError?.value?.(new Error('no livekit url provided'));
        return;
      }

      const attemptConnection = async () => {
        try {
          const url = serverUrl.value;
          const tokenValue = token.value;

          if (!url || !tokenValue) {
            return;
          }

          await currentRoom.connect(url, tokenValue, connectOptions?.value);

          // Only update state if this effect instance hasn't been cleaned up
          if (!effectState.canceled && shouldConnect.value) {
            connectionState.value = ConnectionState.Connected;
          }
        } catch (e) {
          console.warn('Connection error:', e);
          // Only update state if this effect instance hasn't been cleaned up
          if (!effectState.canceled && shouldConnect.value) {
            connectionState.value = ConnectionState.Failed;
            onError?.value?.(e as Error);
          }
        }
      };

      attemptConnection();
    } else {
      console.debug('disconnecting because connect is false');
      shouldConnect.value = false;

      currentRoom
        .disconnect()
        .then(() => {
          if (!effectState.canceled) {
            connectionState.value = ConnectionState.Disconnected;
          }
        })
        .catch(() => {
          if (!effectState.canceled) {
            connectionState.value = ConnectionState.Disconnected;
          }
        });
    }

    onCleanup(() => {
      effectState.canceled = true;
      if (currentRoom && shouldConnect.value) {
        console.debug('disconnecting due to dependency change or unmount');
        shouldConnect.value = false;

        currentRoom.disconnect().catch(() => {
          connectionState.value = ConnectionState.Disconnected;
        });
      }
    });
  });

  watchEffect(() => {
    JSON.stringify(options?.value, roomOptionsStringifyReplacer);
    room.value = passedRoom?.value ?? new Room(options?.value);
  });

  onMounted(() => {
    if (options?.value && passedRoom?.value) {
      console.warn(
        'when using a manually created room, the options object will be ignored. set the desired options directly when creating the room instead.',
      );
    }
  });

  onBeforeUnmount(() => {
    if (room.value) {
      room.value.disconnect().catch((e) => {
        console.warn('Error during disconnection:', e);
      });
    }
  });

  return { room, connectionState };
}
