import type { DisconnectButtonProps } from '@/components/controls/buttons';
import { useEnsureRoomContext } from '@/context/room.context';
import { ConnectionState } from 'livekit-client';
import { computed, type Ref } from 'vue';
import { useConnectionState } from './useConnectionState';

export type UseDisconnectButton = {
  onClick: () => void;
  disabled: Ref<boolean>;
};

export function useDisconnectButton(props: DisconnectButtonProps): UseDisconnectButton {
  const room = useEnsureRoomContext();
  const { connectionState } = useConnectionState(room.value);

  const disabled = computed<boolean>(() => {
    return connectionState.value === ConnectionState.Disconnected;
  });

  function onClick(): void {
    disconnect(props.stopTracks);
  }

  function disconnect(stopTracks?: boolean): void {
    room.value.disconnect(stopTracks);
  }

  return {
    onClick,
    disabled,
  };
}
