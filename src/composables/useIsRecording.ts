import { useEnsureRoomContext } from '@/context/room.context';
import { recordingStatusObservable } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';
import { useConnectionState } from './useConnectionState';

export type UseIsRecording = {
  isRecording: Ref<boolean>;
};

export function useIsRecording(room?: Room): UseIsRecording {
  const r = useEnsureRoomContext(room);

  const { connectionState } = useConnectionState({ room });

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
