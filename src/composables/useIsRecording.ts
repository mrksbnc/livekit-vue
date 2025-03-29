import { useEnsureRoomContext } from '@/context/room.context';
import { recordingStatusObservable } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';
import { useConnectionState } from './useConnectionState';

export type UseIsRecording = {
  isRecording: Ref<boolean>;
};

export type UseIsRecordingProps = {
  room?: Room;
};

export function useIsRecording(props: UseIsRecordingProps): UseIsRecording {
  const r = useEnsureRoomContext(props.room);

  const { connectionState } = useConnectionState({ room: r.value });

  const isRecording = ref<boolean>(r.value.isRecording || false);

  const observable = computed<ReturnType<typeof recordingStatusObservable>>(() => {
    console.debug('Connection state:', connectionState.value);
    return recordingStatusObservable(r.value);
  });

  watchEffect((onCleanup): void => {
    const subscription = observable.value.subscribe({
      next: (recording: boolean): void => {
        isRecording.value = recording;
      },
      error: (err: Error): void => {
        console.error('Recording status observer error:', err);
      },
    });

    onCleanup((): void => {
      subscription.unsubscribe();
    });
  });

  return { isRecording };
}
