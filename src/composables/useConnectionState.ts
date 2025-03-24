import { useEnsureRoomContext } from '@/context/room.context';
import { connectionStateObserver } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import { ConnectionState, type Room } from 'livekit-client';
import { ref, type Ref } from 'vue';

export type UseConnectionState = {
  connectionState: Ref<ConnectionState>;
};

export function useConnectionState(room?: Room): UseConnectionState {
  const r = useEnsureRoomContext(room);

  const connectionState = ref<ConnectionState>(r.value.state);

  useSubscription(
    connectionStateObserver(r.value).subscribe((state) => {
      connectionState.value = state;
    }),
  );

  return { connectionState };
}
