import { useEnsureTrackRef } from '@/context/track_reference.context';
import type { ParticipantClickEvent, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { Track, TrackPublication } from 'livekit-client';
import { computed, shallowRef, type HTMLAttributes, type ShallowRef } from 'vue';
import { useFacingMode } from './useFacingMode';
import { useIsMuted } from './useIsMuted';
import { useIsSpeaking } from './useIsSpeaking';

export type UseParticipantTileProps = {
  trackRef?: TrackReferenceOrPlaceholder;
  disableSpeakingIndicator?: boolean;
  onParticipantClick?: (event: ParticipantClickEvent) => void;
  htmlProps: HTMLAttributes;
};

export function useParticipantTile(options: UseParticipantTileProps): {
  elementProps: ShallowRef<HTMLAttributes>;
} {
  const trackReference = useEnsureTrackRef(options.trackRef);

  const htmlElementAttributes = computed<HTMLAttributes>(() => {
    return {
      class: 'lk-participant-tile',
      onClick: (event: MouseEvent) => {
        options.htmlProps.onClick?.(event);

        if (typeof options.onParticipantClick === 'function') {
          const track =
            trackReference.value.publication ??
            trackReference.value.participant.getTrackPublication(trackReference.value.source);

          options.onParticipantClick({ participant: trackReference.value.participant, track });
        }
      },
    };
  });

  const micTrack = computed<TrackPublication | undefined>(() => {
    return trackReference.value.participant.getTrackPublication(Track.Source.Microphone);
  });

  const micRef = computed<TrackReferenceOrPlaceholder>(() => {
    const trackRef: TrackReferenceOrPlaceholder = {
      participant: trackReference.value.participant,
      source: Track.Source.Microphone,
      publication: micTrack.value,
    };

    return trackRef;
  });

  const isVideoMuted = useIsMuted(trackReference.value);
  const isAudioMuted = useIsMuted(micRef.value);
  const isSpeaking = useIsSpeaking(trackReference.value.participant);
  const facingMode = useFacingMode(trackReference.value);

  return {
    elementProps: shallowRef({
      'data-lk-audio-muted': isAudioMuted,
      'data-lk-video-muted': isVideoMuted,
      'data-lk-speaking': options.disableSpeakingIndicator === true ? false : isSpeaking,
      'data-lk-local-participant': trackReference.value.participant.isLocal,
      'data-lk-source': trackReference.value.source,
      'data-lk-facing-mode': facingMode,
      ...htmlElementAttributes.value,
    }),
  };
}
