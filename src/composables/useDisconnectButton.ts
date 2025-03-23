import type { DisconnectButtonProps } from '@/components/controls/buttons';
import { useEnsureRoomContext } from '@/context/room.context';
import { ConnectionState } from 'livekit-client';
import { computed, type HTMLAttributes, type ShallowRef } from 'vue';
import { useConnectionState } from './useConnectionState';

export function useDisconnectButton(props: DisconnectButtonProps): {
  buttonProps: ShallowRef<HTMLAttributes>;
} {
  const room = useEnsureRoomContext();
  const connectionState = useConnectionState(room.value);

  function disconnect(stopTracks?: boolean) {
    room.value.disconnect(stopTracks);
  }

  const buttonProps = computed<HTMLAttributes>(() => {
    return {
      ...props,
      onClick: () => disconnect(),
      disabled: connectionState.value === ConnectionState.Disconnected,
    };
  });

  return {
    buttonProps,
  };
}
