import { useEnsureRoomContext } from '@/context/room.context';
import { roomAudioPlaybackAllowedObservable } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Room } from 'livekit-client';
import { Observable } from 'rxjs';
import { ref, type ShallowRef } from 'vue';

export type AudioPlaybackObservable = Observable<{
  canPlayAudio: boolean;
}>;

export type UseAudioPlaybackRetunType = {
  canPlayAudio: ShallowRef<boolean>;
  startAudio: () => Promise<void>;
};

export function useAudioPlayback(room?: Room): UseAudioPlaybackRetunType {
  const roomEnsured = useEnsureRoomContext(room);

  const canPlayAudio = ref<boolean>(true);

  async function startAudio() {
    await roomEnsured.value.startAudio();
  }

  useSubscription(
    roomAudioPlaybackAllowedObservable(roomEnsured.value).subscribe((evt) => {
      canPlayAudio.value = evt.canPlayAudio;
    }),
  );

  return {
    canPlayAudio,
    startAudio,
  };
}
