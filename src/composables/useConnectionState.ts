import { useEnsureRoomContext } from '@/context/room.context';
import { connectionStateObserver } from '@livekit/components-core';
import { ConnectionState, type Room } from 'livekit-client';
import { Observable } from 'rxjs';
import { computed, type ShallowRef } from 'vue';
import { useObservableState } from './private/useObservableState';

export function useConnectionState(room?: Room): ShallowRef<ConnectionState> {
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
