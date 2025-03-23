import { useEnsureRoomContext } from '@/context/room.context';
import { activeSpeakerObserver } from '@livekit/components-core';
import { useObservable } from '@vueuse/rxjs';
import type { Participant } from 'livekit-client';
import type { Observable } from 'rxjs';
import type { ShallowRef } from 'vue';
import { useObservableState } from './private/useObservableState';

export function useSpeakingParticipants(): ShallowRef<Participant[]> {
  const room = useEnsureRoomContext();

  const speakerObserver = useObservable(
    activeSpeakerObserver(room.value) as unknown as Observable<Participant[]>,
  );

  const activeSpeakers = useObservableState({
    observable: speakerObserver.value as unknown as Observable<Participant[]>,
    startWith: room.value.activeSpeakers,
  });

  return activeSpeakers;
}
