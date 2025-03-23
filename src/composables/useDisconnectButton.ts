import type { DisconnectButtonProps } from '@/components/controls/buttons';
import { useEnsureRoomContext } from '@/context/room.context';
import { ConnectionState } from 'livekit-client';
import { computed, type HTMLAttributes } from 'vue';
import { useConnectionState } from './useConnectionState';

export function useDisconnectButton(props: DisconnectButtonProps) {
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
