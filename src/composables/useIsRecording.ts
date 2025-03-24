import { useEnsureRoomContext } from '@/context/room.context';
import { recordingStatusObservable } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Room } from 'livekit-client';
import type { Observable } from 'rxjs';
import { ref, type Ref } from 'vue';

export type UseIsRecordingObservable = Observable<boolean>;

export type UseIsRecording = {
  isRecording: Ref<boolean>;
};

export function useIsRecording(room?: Room): UseIsRecording {
  const r = useEnsureRoomContext(room);

  const isRecording = ref<boolean>(r.value.isRecording ?? false);

  useSubscription(
    recordingStatusObservable(r.value).subscribe((recording) => {
      isRecording.value = recording;
    }),
  );

  return { isRecording };
}
