import { useEnsureParticipant } from '@/context/participant.context';
import {
  mutedObserver,
  type TrackReference,
  type TrackReferenceOrPlaceholder,
  type TrackReferencePlaceholder,
} from '@livekit/components-core';
import type { Participant, Track } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';

export type UseIsMutedProps = {
  participant?: Participant;
  sourceOrTrackRef: TrackReferenceOrPlaceholder | Track.Source;
};

export type UseIsMuted = {
  isMuted: Ref<boolean>;
};

export function useIsMuted(props: UseIsMutedProps): UseIsMuted;
export function useIsMuted(props: UseIsMutedProps): UseIsMuted {
  const passedParticipant =
    typeof props.sourceOrTrackRef === 'string'
      ? props.participant
      : props.sourceOrTrackRef.participant;

  const p = useEnsureParticipant(passedParticipant);

  const trackReference = computed<TrackReference | TrackReferencePlaceholder>(() => {
    return typeof props.sourceOrTrackRef === 'string'
      ? { participant: p.value, source: props.sourceOrTrackRef }
      : props.sourceOrTrackRef;
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
