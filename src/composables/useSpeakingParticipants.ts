import { useEnsureRoomContext } from '@/context/room.context';
import { activeSpeakerObserver } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant } from 'livekit-client';
import { ref, type ShallowRef } from 'vue';

export function useSpeakingParticipants(): ShallowRef<Participant[]> {
  const room = useEnsureRoomContext();

  const activeSpeakers = ref<Participant[]>(room.value.activeSpeakers ?? []);

  useSubscription(
    activeSpeakerObserver(room.value).subscribe((speakers) => {
      activeSpeakers.value = speakers;
    }),
  );

  return activeSpeakers as ShallowRef<Participant[]>;
}
