import { useEnsureRoomContext } from '@/context/room.context';
import { recordingStatusObservable } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import type { Observable } from 'rxjs';
import { ref, watch } from 'vue';
import { useObservableState } from './private/useObservableState';
import { useConnectionState } from './useConnectionState';

export function useIsRecording(room?: Room) {
  const r = useEnsureRoomContext(room);

  const connectionState = useConnectionState(r.value);

  const observable = ref<Observable<boolean>>(
    recordingStatusObservable(r.value) as unknown as Observable<boolean>,
  );

  const isRecording = useObservableState({
    observable: observable.value as unknown as Observable<boolean>,
    startWith: r.value.isRecording,
  });

  watch([connectionState, r], () => {
    observable.value = recordingStatusObservable(r.value) as unknown as Observable<boolean>;
  });

  return isRecording;
}
