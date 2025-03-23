import { useRoomContext } from '@/context/room.context';
import type { LiveKitRoomProps } from '@/types/livekit_room.types';
import { roomOptionsStringifyReplacer } from '@/utils/room.utils';
import { DisconnectReason, MediaDeviceFailure, Room, RoomEvent } from 'livekit-client';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  onWatcherCleanup,
  ref,
  toRefs,
  watch,
  type HTMLAttributes,
  type Ref,
  type ShallowRef,
} from 'vue';

export type UseLiveKitRoomReturn = {
  room: ShallowRef<Room | undefined>;
  elementProps: ShallowRef<HTMLAttributes>;
};

const defaultRoomProps: Partial<LiveKitRoomProps> = {
  connect: true,
  audio: false,
  video: false,
};

export function useLiveKitRoom(props: LiveKitRoomProps): UseLiveKitRoomReturn {
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
    htmlProps,
  } = toRefs({ ...defaultRoomProps, ...props });

  const shouldConnect = ref(connect?.value ?? false);
  const room = ref<Room | undefined>(passedRoom?.value ?? useRoomContext()?.value);

  const elementProps = computed<HTMLAttributes>(() => {
    return {
      ...htmlProps?.value,
      class: 'lk-room-container',
    };
  });

  function onSignalConnected() {
    const localP = room.value?.localParticipant;

    console.debug('trying to publish local tracks');
    Promise.all([
      localP?.setMicrophoneEnabled(
        !!audio?.value,
        typeof audio?.value !== 'boolean' ? audio?.value : undefined,
      ),
      localP?.setCameraEnabled(
        !!video?.value,
        typeof video?.value !== 'boolean' ? video?.value : undefined,
      ),
      localP?.setScreenShareEnabled(
        !!screen?.value,
        typeof screen?.value !== 'boolean' ? screen?.value : undefined,
      ),
    ]).catch((e) => {
      console.warn(e);
      onError?.value?.(e as Error);
    });
  }

  function handleMediaDeviceError(e: Error) {
    const mediaDeviceFailure = MediaDeviceFailure.getFailure(e);
    onMediaDeviceFailure?.value?.(mediaDeviceFailure);
  }
  function handleEncryptionError(e: Error) {
    onEncryptionError?.value?.(e);
  }

  function handleDisconnected(reason?: DisconnectReason) {
    onDisconnected?.value?.(reason);
  }

  function handleConnected() {
    onConnected?.value?.();
  }

  watch(
    [passedRoom, options, roomOptionsStringifyReplacer],
    () => {
      room.value = passedRoom?.value ?? new Room(options?.value);
    },
    {
      deep: true,
      immediate: true,
    },
  );

  watch(
    [
      room,
      audio,
      video,
      screen,
      onError,
      onEncryptionError,
      onMediaDeviceFailure,
      onConnected,
      onDisconnected,
    ],
    () => {
      if (!room.value) {
        return;
      }

      room.value
        .on(RoomEvent.SignalConnected, onSignalConnected)
        .on(RoomEvent.MediaDevicesError, handleMediaDeviceError)
        .on(RoomEvent.EncryptionError, handleEncryptionError)
        .on(RoomEvent.Disconnected, handleDisconnected)
        .on(RoomEvent.Connected, handleConnected);

      onWatcherCleanup(() => {
        if (!room.value) {
          return;
        }

        room.value
          .off(RoomEvent.SignalConnected, onSignalConnected)
          .off(RoomEvent.MediaDevicesError, handleMediaDeviceError)
          .off(RoomEvent.EncryptionError, handleEncryptionError)
          .off(RoomEvent.Disconnected, handleDisconnected)
          .off(RoomEvent.Connected, handleConnected);
      });
    },
    {
      deep: true,
    },
  );

  watch(
    [connect, token, connectOptions, room, onError, serverUrl, simulateParticipants],
    () => {
      if (!room.value) return;

      if (simulateParticipants?.value) {
        room.value.simulateParticipants({
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

        console.debug('connecting');

        if (!token.value) {
          console.debug('no token yet');
          return;
        }

        if (!serverUrl.value) {
          console.warn('no livekit url provided');
          onError?.value?.(Error('no livekit url provided'));
          return;
        }

        room.value.connect(serverUrl.value, token.value, connectOptions?.value).catch((e) => {
          console.warn(e);
          if (shouldConnect.value === true) {
            onError?.value?.(e as Error);
          }
        });
      } else {
        console.debug('disconnecting because connect is false');
        shouldConnect.value = false;
        room.value.disconnect();
      }
    },
    { deep: true },
  );

  onMounted(() => {
    if (options?.value && passedRoom) {
      console.warn(
        'when using a manually created room, the options object will be ignored. set the desired options directly when creating the room instead.',
      );
    }
  });

  onBeforeUnmount(() => {
    if (room.value) {
      console.info('disconnecting before unmounting');
      room.value.disconnect();
    }
  });

  return {
    room: room as Ref<Room | undefined>,
    elementProps,
  };
}
