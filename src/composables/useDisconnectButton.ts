import type { DisconnectButtonProps } from '@/components/controls/buttons';
import { useEnsureRoomContext } from '@/context/room.context';
import { ConnectionState } from 'livekit-client';
import { computed, shallowRef, type ShallowRef } from 'vue';
import { useConnectionState } from './useConnectionState';

export function useDisconnectButton(props: DisconnectButtonProps): {
  onClick: () => void;
  disabled: ShallowRef<boolean>;
} {
  const room = useEnsureRoomContext();
  const connectionState = useConnectionState(room.value);

  function disconnect(stopTracks?: boolean) {
    room.value.disconnect(stopTracks);
  }

  const buttonProps = computed(() => {
    return {
      onClick: () => disconnect(props.stopTracks),
      disabled: connectionState.value === ConnectionState.Disconnected,
    };
  });

  return {
    onClick: buttonProps.value.onClick,
    disabled: shallowRef(buttonProps.value.disabled),
  };
}
