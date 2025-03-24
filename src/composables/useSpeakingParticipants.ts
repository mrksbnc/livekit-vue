import { useEnsureRoomContext } from '@/context/room.context';
import { activeSpeakerObserver } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant } from 'livekit-client';
import { shallowRef, type ShallowRef } from 'vue';

export type UseSpeakingParticipants = {
  activeSpeakers: ShallowRef<Participant[]>;
};

export function useSpeakingParticipants(): UseSpeakingParticipants {
  const room = useEnsureRoomContext();

  const activeSpeakers = shallowRef<Participant[]>(room.value.activeSpeakers ?? []);

  useSubscription(
    activeSpeakerObserver(room.value).subscribe((speakers) => {
      activeSpeakers.value = speakers;
    }),
  );

  return { activeSpeakers };
}
