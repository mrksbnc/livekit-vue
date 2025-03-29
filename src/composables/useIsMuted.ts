import { useEnsureParticipant } from '@/context/participant.context';
import {
  mutedObserver,
  type TrackReference,
  type TrackReferenceOrPlaceholder,
  type TrackReferencePlaceholder,
} from '@livekit/components-core';
import type { Participant, Track } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';

export type UseIsMutedOptions = {
  participant?: Participant;
};

export type UseIsMuted = {
  isMuted: Ref<boolean>;
};

export function useIsMuted(trackRef: TrackReferenceOrPlaceholder): UseIsMuted;
export function useIsMuted(
  sourceOrTrackRef: TrackReferenceOrPlaceholder | Track.Source,
  options: UseIsMutedOptions = {},
): UseIsMuted {
  const passedParticipant =
    typeof sourceOrTrackRef === 'string' ? options.participant : sourceOrTrackRef.participant;

  const p = useEnsureParticipant(passedParticipant);

  const trackReference = computed<TrackReference | TrackReferencePlaceholder>(() => {
    return typeof sourceOrTrackRef === 'string'
      ? { participant: p.value, source: sourceOrTrackRef }
      : sourceOrTrackRef;
  });

  const isMuted = ref<boolean>(
    !!(
      trackReference.value.publication?.isMuted ||
      p.value.getTrackPublication(trackReference.value.source)?.isMuted
    ),
  );

  const observable = computed<ReturnType<typeof mutedObserver>>(() =>
    mutedObserver(trackReference.value),
  );

  watchEffect((onCleanup): void => {
    const subscription = observable.value.subscribe({
      next: (muted: boolean): void => {
        isMuted.value = muted;
      },
      error: (err: Error): void => {
        console.error('Muted state observer error:', err);
      },
    });

    onCleanup((): void => {
      subscription.unsubscribe();
    });
  });

  return { isMuted };
}
