import { useEnsureRoomContext } from '@/context/room.context';
import { connectionStateObserver } from '@livekit/components-core';
import { ConnectionState, type Room } from 'livekit-client';
import { Observable } from 'rxjs';
import { computed } from 'vue';
import { useObservableState } from './private/useObservableState';

export function useConnectionState(room?: Room) {
  // passed room takes precedence, if not supplied get current room context
  const r = useEnsureRoomContext(room);

  const observable = computed<Observable<ConnectionState>>(
    () => connectionStateObserver(r.value) as unknown as Observable<ConnectionState>,
  );

  const connectionState = useObservableState({
    observable: observable.value as unknown as Observable<ConnectionState>,
    startWith: r.value.state,
  });

  return connectionState;
}
