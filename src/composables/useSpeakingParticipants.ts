import { useEnsureRoomContext } from '@/context/room.context';
import { activeSpeakerObserver } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { shallowRef, watchEffect, type ShallowRef } from 'vue';

export type UseSpeakingParticipants = {
  activeSpeakers: ShallowRef<Participant[]>;
};

export function useSpeakingParticipants(): UseSpeakingParticipants {
  const room = useEnsureRoomContext();
  const activeSpeakers = shallowRef<Participant[]>(room.value?.activeSpeakers ?? []);

  watchEffect((onCleanup) => {
    if (!room.value) {
      return;
    }

    const observable = activeSpeakerObserver(room.value);

    const subscription = observable.subscribe({
      next: (speakers) => {
        activeSpeakers.value = speakers ?? [];
      },
      error: (err) => {
        console.error('Error in active speaker observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return { activeSpeakers };
}
