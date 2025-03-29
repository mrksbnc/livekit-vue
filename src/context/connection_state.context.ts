import { createInjectionState } from '@vueuse/core';
import { ConnectionState } from 'livekit-client';
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { NoContextDataProvidedError } from './error';

export type ConnectionStateContextState = {
  connectionState: Ref<ConnectionState>;
};

export type ConnectionStateContext = {
  state: ConnectionStateContextState;
  isConnecting: ComputedRef<boolean>;
  isConnected: ComputedRef<boolean>;
  isReconnecting: ComputedRef<boolean>;
  isDisconnected: ComputedRef<boolean>;
  setConnectionState: (state: ConnectionState) => void;
};

const [useProvideConnectionStateContext, useConnectionStateContextRaw] = createInjectionState(
  (initialState?: Partial<ConnectionStateContextState>): ConnectionStateContext => {
    const state: ConnectionStateContextState = {
      connectionState:
        initialState?.connectionState ?? ref<ConnectionState>(ConnectionState.Disconnected),
    };

    const isConnecting = computed<boolean>(
      () => state.connectionState.value === ConnectionState.Connecting,
    );
    const isConnected = computed<boolean>(
      () => state.connectionState.value === ConnectionState.Connected,
    );
    const isReconnecting = computed<boolean>(
      () => state.connectionState.value === ConnectionState.Reconnecting,
    );
    const isDisconnected = computed<boolean>(
      () => state.connectionState.value === ConnectionState.Disconnected,
    );

    const setConnectionState = (connectionState: ConnectionState) => {
      state.connectionState.value = connectionState;
    };

    return {
      state,
      isConnecting,
      isConnected,
      isReconnecting,
      isDisconnected,
      setConnectionState,
    };
  },
);

export { useConnectionStateContextRaw, useProvideConnectionStateContext };

export function useMaybeConnectionStateContext(): ConnectionStateContext | undefined {
  return useConnectionStateContextRaw();
}

export function useConnectionStateContext(): ConnectionStateContext {
  const context = useMaybeConnectionStateContext();

  if (!context) {
    throw new NoContextDataProvidedError(
      'Please call `useProvideConnectionStateContext` on the appropriate parent component',
    );
  }

  return context;
}

export function createConnectionStateContext(
  initialState?: Partial<ConnectionStateContextState>,
): ConnectionStateContext {
  const state: ConnectionStateContextState = {
    connectionState:
      initialState?.connectionState ?? ref<ConnectionState>(ConnectionState.Disconnected),
  };

  const isConnecting = computed<boolean>(
    () => state.connectionState.value === ConnectionState.Connecting,
  );
  const isConnected = computed<boolean>(
    () => state.connectionState.value === ConnectionState.Connected,
  );
  const isReconnecting = computed<boolean>(
    () => state.connectionState.value === ConnectionState.Reconnecting,
  );
  const isDisconnected = computed<boolean>(
    () => state.connectionState.value === ConnectionState.Disconnected,
  );

  const setConnectionState = (connectionState: ConnectionState) => {
    state.connectionState.value = connectionState;
  };

  return {
    state,
    isConnecting,
    isConnected,
    isReconnecting,
    isDisconnected,
    setConnectionState,
  };
}
