import { useEnsureRoomContext } from '@/context/room.context';
import { setupDisconnectButton } from '@livekit/components-core';
import { ConnectionState } from 'livekit-client';
import { computed, type ComputedRef } from 'vue';
import { useConnectionState } from './useConnectionState';

export type DisconnectButtonOptions = {
  stopTracks?: boolean;
};

export type UseDisconnectButton = {
  disabled: ComputedRef<boolean>;
  onClick: () => void;
};

export function useDisconnectButton(options: DisconnectButtonOptions = {}): UseDisconnectButton {
  const room = useEnsureRoomContext();
  const { connectionState } = useConnectionState({
    room: room.value,
  });

  const setup = computed<ReturnType<typeof setupDisconnectButton>>(() =>
    setupDisconnectButton(room.value),
  );

  const disabled = computed<boolean>(() => connectionState.value === ConnectionState.Disconnected);

  function onClick(): void {
    setup.value.disconnect(options.stopTracks ?? true);
  }

  return {
    disabled,
    onClick,
  };
}
