import { useEnsureRoomContext } from '@/context/room.context';
import { recordingStatusObservable } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Room } from 'livekit-client';
import type { Observable } from 'rxjs';
import { ref, type ShallowRef } from 'vue';
import { useConnectionState } from './useConnectionState';

export type UseIsRecordingObservable = Observable<boolean>;

export function useIsRecording(room?: Room): ShallowRef<boolean> {
  const r = useEnsureRoomContext(room);

  const connectionState = useConnectionState(r.value);

  const isRecording = ref<boolean>(r.value.isRecording ?? false);

  const observable = ref<UseIsRecordingObservable>(
    recordingStatusObservable(r.value) as unknown as UseIsRecordingObservable,
  );

  useSubscription(
    recordingStatusObservable(r.value).subscribe((recording) => {
      isRecording.value = recording;
    }),
  );

  return isRecording;
}
