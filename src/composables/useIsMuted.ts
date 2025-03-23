import { useEnsureParticipant } from '@/context/participant.context';
import {
  getTrackReferenceId,
  mutedObserver,
  type TrackReference,
  type TrackReferenceOrPlaceholder,
  type TrackReferencePlaceholder,
} from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant, Track } from 'livekit-client';
import { computed, ref, watch, type ShallowRef } from 'vue';

export type UseIsMutedOptions = {
  participant?: Participant;
};

export function useIsMuted(trackRef: TrackReferenceOrPlaceholder): ShallowRef<boolean>;
export function useIsMuted(
  sourceOrTrackRef: TrackReferenceOrPlaceholder | Track.Source,
  options: UseIsMutedOptions = {},
): ShallowRef<boolean> {
  const passedParticipant = computed<Participant | undefined>(() =>
    typeof sourceOrTrackRef === 'string' ? options.participant : sourceOrTrackRef.participant,
  );

  const p = useEnsureParticipant(passedParticipant.value);

  const trackRef = computed<TrackReference | TrackReferencePlaceholder>(() => {
    const track =
      typeof sourceOrTrackRef === 'string'
        ? { participant: p.value, source: sourceOrTrackRef }
        : sourceOrTrackRef;

    return track;
  });

  const isMuted = ref(
    !!(
      trackRef.value.publication?.isMuted ||
      p.value.getTrackPublication(trackRef.value.source)?.isMuted
    ),
  );

  watch(
    () => getTrackReferenceId(trackRef.value),
    () => {
      useSubscription(
        mutedObserver(trackRef.value).subscribe((muted) => {
          isMuted.value = muted;
        }),
      );
    },
  );

  return isMuted;
}
