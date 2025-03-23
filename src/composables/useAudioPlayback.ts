import { useEnsureRoomContext } from '@/context/room.context';
import { roomAudioPlaybackAllowedObservable } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { Observable } from 'rxjs';
import { computed, toRefs, type ShallowRef } from 'vue';
import { useObservableState } from './private/useObservableState';

export type AudioPlaybackObservable = Observable<{
  canPlayAudio: boolean;
}>;

export type UseAudioPlaybackRetunType = {
  canPlayAudio: ShallowRef<boolean>;
  startAudio: () => Promise<void>;
};

export function useAudioPlayback(room?: Room): UseAudioPlaybackRetunType {
  const roomEnsured = useEnsureRoomContext(room);

  async function startAudio() {
    await roomEnsured.value.startAudio();
  }

  const observable = computed<AudioPlaybackObservable>(
    () =>
      roomAudioPlaybackAllowedObservable(roomEnsured.value) as unknown as AudioPlaybackObservable,
  );

  const observableState = useObservableState({
    observable: observable.value as unknown as AudioPlaybackObservable,
    startWith: {
      canPlayAudio: roomEnsured.value.canPlaybackVideo,
    },
  });

  const { canPlayAudio } = toRefs(observableState.value);

  return {
    canPlayAudio,
    startAudio,
  };
}
