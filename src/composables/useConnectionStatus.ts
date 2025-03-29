import { ConnectionState } from 'livekit-client';
import { computed, type ComputedRef } from 'vue';
import { useConnectionState, type ConnectionStateProps } from './useConnectionState';

export interface UseConnectionStatus {
  connectionState: ComputedRef<ConnectionState>;
  statusText: ComputedRef<string>;
  isConnecting: ComputedRef<boolean>;
  isConnected: ComputedRef<boolean>;
  isReconnecting: ComputedRef<boolean>;
  isDisconnected: ComputedRef<boolean>;
  attributes: ComputedRef<Record<string, unknown>>;
}

export interface ConnectionStatusProps extends ConnectionStateProps {
  statusMessages?: Partial<Record<ConnectionState, string>>;
}

const DEFAULT_STATUS_MESSAGES: Record<ConnectionState, string> = {
  [ConnectionState.Connecting]: 'Connecting...',
  [ConnectionState.Connected]: 'Connected',
  [ConnectionState.Disconnected]: 'Disconnected',
  [ConnectionState.Reconnecting]: 'Reconnecting...',
  [ConnectionState.SignalReconnecting]: 'Reconnecting to signal...',
};

export function useConnectionStatus(props: ConnectionStatusProps = {}): UseConnectionStatus {
  const { connectionState } = useConnectionState({ room: props.room });

  const statusText = computed<string>(() => {
    const customMessage = props.statusMessages?.[connectionState.value];
    return customMessage || DEFAULT_STATUS_MESSAGES[connectionState.value];
  });

  const isConnecting = computed<boolean>(
    () => connectionState.value === ConnectionState.Connecting,
  );
  const isConnected = computed<boolean>(() => connectionState.value === ConnectionState.Connected);
  const isReconnecting = computed<boolean>(
    () => connectionState.value === ConnectionState.Reconnecting,
  );
  const isDisconnected = computed<boolean>(
    () => connectionState.value === ConnectionState.Disconnected,
  );

  const attributes = computed<Record<string, unknown>>(() => {
    return {
      'lk-connection-connected': isConnected.value,
      'lk-connection-connecting': isConnecting.value,
      'lk-connection-disconnected': isDisconnected.value,
      'lk-connection-reconnecting': isReconnecting.value,
    };
  });

  return {
    connectionState: computed(() => connectionState.value),
    statusText,
    isConnecting,
    isConnected,
    isReconnecting,
    isDisconnected,
    attributes,
  };
}
