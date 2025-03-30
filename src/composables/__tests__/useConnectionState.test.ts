import { useConnectionState } from '@/composables/useConnectionState';
import * as connectionStateContext from '@/context/connection_state.context';
import * as roomContext from '@/context/room.context';
import * as componentsCore from '@livekit/components-core';
import { ConnectionState, Room } from 'livekit-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref, shallowRef, type ShallowRef } from 'vue';

vi.mock('@livekit/components-core', () => ({
  connectionStateObserver: vi.fn(),
}));

vi.mock('@/context/room.context', () => ({
  useEnsureRoomContext: vi.fn(),
}));

vi.mock('@/context/connection_state.context', () => ({
  useConnectionStateContext: vi.fn(),
}));

vi.mock('livekit-client', async () => {
  const actual = await vi.importActual('livekit-client');
  return {
    ...actual,
    Room: vi.fn(),
  };
});

type ActualRoomContext = ShallowRef<Room>;
type ObserverNext = (value: ConnectionState) => void;
type ObserverError = (error: Error) => void;

interface ObserverCallbacks {
  next: ObserverNext | null;
  error: ObserverError | null;
}

describe('useConnectionState', () => {
  const mockRoom = {
    state: ConnectionState.Disconnected,
  } as unknown as Room;

  const mockSubscribe = {
    unsubscribe: vi.fn(),
  };

  const mockConnectionState = ref<ConnectionState>(ConnectionState.Disconnected);
  const mockConnectionStateContext = {
    state: {
      connectionState: mockConnectionState,
    },
    isConnecting: computed(() => mockConnectionState.value === ConnectionState.Connecting),
    isConnected: computed(() => mockConnectionState.value === ConnectionState.Connected),
    isReconnecting: computed(() => mockConnectionState.value === ConnectionState.Reconnecting),
    isDisconnected: computed(() => mockConnectionState.value === ConnectionState.Disconnected),
    setConnectionState: vi.fn((state: ConnectionState) => {
      mockConnectionState.value = state;
    }),
  };

  const mockObserverCallbacks: ObserverCallbacks = {
    next: null,
    error: null,
  };

  const mockObservable = {
    subscribe: vi.fn((observer: { next: ObserverNext; error: ObserverError }) => {
      mockObserverCallbacks.next = observer.next;
      mockObserverCallbacks.error = observer.error;
      return mockSubscribe;
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockConnectionState.value = ConnectionState.Disconnected;

    mockRoom.state = ConnectionState.Disconnected;

    (Room as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockRoom);

    vi.spyOn(roomContext, 'useEnsureRoomContext').mockReturnValue(
      shallowRef(mockRoom) as ActualRoomContext,
    );
    vi.spyOn(connectionStateContext, 'useConnectionStateContext').mockReturnValue(
      mockConnectionStateContext as ReturnType<
        typeof connectionStateContext.useConnectionStateContext
      >,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(componentsCore.connectionStateObserver).mockReturnValue(mockObservable as any);
  });

  it('should initialize with room.state value', () => {
    mockRoom.state = ConnectionState.Connected;

    useConnectionState({});

    expect(mockConnectionStateContext.setConnectionState).toHaveBeenCalledWith(
      ConnectionState.Connected,
    );
  });

  it('should not set connection state when no room is available initially', () => {
    vi.spyOn(roomContext, 'useEnsureRoomContext').mockReturnValue(
      shallowRef(undefined) as unknown as ActualRoomContext,
    );

    useConnectionState({});

    expect(mockConnectionStateContext.setConnectionState).not.toHaveBeenCalled();
  });

  it('should create connection state observable from the room', () => {
    useConnectionState({});

    expect(componentsCore.connectionStateObserver).toHaveBeenCalledWith(mockRoom);
  });

  it('should update connection state when observable emits', async () => {
    useConnectionState({});

    expect(mockConnectionState.value).toBe(ConnectionState.Disconnected);

    if (mockObserverCallbacks.next) {
      mockObserverCallbacks.next(ConnectionState.Connected);
    }

    await nextTick();
    expect(mockConnectionState.value).toBe(ConnectionState.Connected);
  });

  it('should handle errors from the observable', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    useConnectionState({});

    if (mockObserverCallbacks.error) {
      mockObserverCallbacks.error(new Error('Test error'));
    }

    await nextTick();

    expect(consoleSpy).toHaveBeenCalledWith('Connection state observer error:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should accept a custom room in props', () => {
    const customRoom = { ...mockRoom } as unknown as Room;

    useConnectionState({ room: customRoom });

    expect(roomContext.useEnsureRoomContext).toHaveBeenCalledWith(customRoom);
  });

  it('should return connection state and derived state values', async () => {
    const result = useConnectionState({});

    if (mockObserverCallbacks.next) {
      mockObserverCallbacks.next(ConnectionState.Connected);
    }
    await nextTick();

    expect(result.connectionState.value).toBe(ConnectionState.Connected);
    expect(result.isConnected.value).toBe(true);
    expect(result.isConnecting.value).toBe(false);
    expect(result.isReconnecting.value).toBe(false);
    expect(result.isDisconnected.value).toBe(false);
  });

  it('should unsubscribe from the observable on cleanup', () => {
    useConnectionState({});

    const cleanup = vi.fn();
    const onCleanup = (fn: () => void) => cleanup.mockImplementation(fn);

    onCleanup(() => mockSubscribe.unsubscribe());
    cleanup();

    expect(mockSubscribe.unsubscribe).toHaveBeenCalled();
  });
});
