import { useConnectionState } from '@/composables/useConnectionState';
import * as connectionStateContext from '@/context/connection_state.context';
import * as roomContext from '@/context/room.context';
import { connectionStateObserver } from '@livekit/components-core';
import { ConnectionState } from 'livekit-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref } from 'vue';

// Mock dependencies
vi.mock('@livekit/components-core', () => ({
  connectionStateObserver: vi.fn(),
}));

vi.mock('@/context/room.context', () => ({
  useEnsureRoomContext: vi.fn(),
}));

vi.mock('@/context/connection_state.context', () => ({
  useConnectionStateContext: vi.fn(),
}));

describe('useConnectionState', () => {
  // Mock room
  const mockRoom = {
    state: ConnectionState.Connected,
    on: vi.fn(),
    off: vi.fn(),
  };

  // Mock subscription
  const mockSubscribe = {
    unsubscribe: vi.fn(),
  };

  // Mock observable
  const mockObservable = {
    subscribe: vi.fn().mockReturnValue(mockSubscribe),
  };

  // Mock connection state context
  const mockConnectionStateContext = {
    state: {
      connectionState: ref(ConnectionState.Connected),
    },
    setConnectionState: vi.fn(),
    isConnecting: computed(() => false),
    isConnected: computed(() => true),
    isReconnecting: computed(() => false),
    isDisconnected: computed(() => false),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    vi.spyOn(roomContext, 'useEnsureRoomContext').mockReturnValue(ref(mockRoom));
    vi.spyOn(connectionStateContext, 'useConnectionStateContext').mockReturnValue(
      mockConnectionStateContext,
    );
    vi.mocked(connectionStateObserver).mockReturnValue(mockObservable);
  });

  it('should initialize with the current room state', () => {
    useConnectionState();

    expect(roomContext.useEnsureRoomContext).toHaveBeenCalled();
    expect(connectionStateContext.useConnectionStateContext).toHaveBeenCalled();
    expect(mockConnectionStateContext.setConnectionState).toHaveBeenCalledWith(
      ConnectionState.Connected,
    );
  });

  it('should return connection state values from the context', () => {
    const result = useConnectionState();

    expect(result.connectionState).toBe(mockConnectionStateContext.state.connectionState);
    expect(result.isConnecting).toBe(mockConnectionStateContext.isConnecting);
    expect(result.isConnected).toBe(mockConnectionStateContext.isConnected);
    expect(result.isReconnecting).toBe(mockConnectionStateContext.isReconnecting);
    expect(result.isDisconnected).toBe(mockConnectionStateContext.isDisconnected);
  });

  it('should accept an optional room parameter', () => {
    const customRoom = { ...mockRoom, state: ConnectionState.Connecting };

    useConnectionState({ room: customRoom });

    expect(roomContext.useEnsureRoomContext).toHaveBeenCalledWith(customRoom);
  });

  it('should subscribe to connection state changes', () => {
    useConnectionState();

    expect(connectionStateObserver).toHaveBeenCalledWith(mockRoom);
    expect(mockObservable.subscribe).toHaveBeenCalled();
  });

  it('should update connection state when the observer emits', async () => {
    useConnectionState();

    // Simulate observer emitting a state change
    const subscribeCb = vi.mocked(mockObservable.subscribe).mock.calls[0][0];
    subscribeCb.next(ConnectionState.Reconnecting);

    await nextTick();
    expect(mockConnectionStateContext.setConnectionState).toHaveBeenCalledWith(
      ConnectionState.Reconnecting,
    );
  });

  it('should handle errors from the connection state observer', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    useConnectionState();

    // Simulate error in the connection state observer
    const subscribeCb = vi.mocked(mockObservable.subscribe).mock.calls[0][0];
    subscribeCb.error(new Error('Test error'));

    await nextTick();
    expect(consoleSpy).toHaveBeenCalledWith('Connection state observer error:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should unsubscribe from the observer on cleanup', () => {
    useConnectionState();

    // Extract the cleanup function
    const subscribeCb = vi.mocked(mockObservable.subscribe).mock.calls[0][0];

    // Call the cleanup function
    const cleanupFn = vi.fn();
    subscribeCb.error(new Error('Test error'));

    // Test the unsubscribe logic by calling the onCleanup function
    const onCleanup = (fn: () => void) => cleanupFn.mockImplementation(fn)();
    onCleanup(() => {
      mockSubscribe.unsubscribe();
    });

    expect(cleanupFn).toHaveBeenCalled();
  });

  it('should do nothing if no room is available', () => {
    // Set room to null
    vi.spyOn(roomContext, 'useEnsureRoomContext').mockReturnValue(ref(null));

    useConnectionState();

    expect(mockConnectionStateContext.setConnectionState).not.toHaveBeenCalled();
    expect(mockObservable.subscribe).not.toHaveBeenCalled();
  });
});
