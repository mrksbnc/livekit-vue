import { useEnsureRoomContext } from '@/context/room.context';
import { recordingStatusObservable } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import type { Observable } from 'rxjs';
import { ref, watch, type ShallowRef } from 'vue';
import { useObservableState } from './private/useObservableState';
import { useConnectionState } from './useConnectionState';

export type UseIsRecordingObservable = Observable<boolean>;

export function useIsRecording(room?: Room): ShallowRef<boolean> {
  const r = useEnsureRoomContext(room);

  const connectionState = useConnectionState(r.value);

  const observable = ref<UseIsRecordingObservable>(
    recordingStatusObservable(r.value) as unknown as UseIsRecordingObservable,
  );

  const isRecording = useObservableState({
    observable: observable.value as unknown as UseIsRecordingObservable,
    startWith: r.value.isRecording,
  });

  watch([connectionState, r], () => {
    observable.value = recordingStatusObservable(r.value) as unknown as UseIsRecordingObservable;
  });

  return isRecording;
}
