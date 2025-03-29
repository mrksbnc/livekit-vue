import { useEnsureTrackRef } from '@/context/track_reference.context';
import type { ParticipantClickEvent, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { Track } from 'livekit-client';
import { computed, type ComputedRef } from 'vue';
import { FacingMode, useFacingMode } from './useFacingMode';
import { useIsMuted } from './useIsMuted';
import { useIsSpeaking } from './useIsSpeaking';

export type ParticipantTileAttributes = {
  'data-lk-audio-muted': boolean;
  'data-lk-video-muted': boolean;
  'data-lk-speaking': boolean;
  'data-lk-local-participant': boolean;
  'data-lk-source': Track.Source;
  'data-lk-facing-mode': FacingMode;
};

export type UseParticipantTileProps = {
  trackRef?: TrackReferenceOrPlaceholder;
  disableSpeakingIndicator?: boolean;
  onParticipantClick?: (event: ParticipantClickEvent) => void;
};

export type UseParticipantTile = {
  attributes: ComputedRef<ParticipantTileAttributes>;
  onClick: () => void;
};

export function useParticipantTile(props: UseParticipantTileProps): UseParticipantTile {
  const trackReference = useEnsureTrackRef(props.trackRef);

  const micRef = computed<TrackReferenceOrPlaceholder>(() => ({
    participant: trackReference.value.participant,
    source: Track.Source.Microphone,
    publication: trackReference.value.participant?.getTrackPublication(Track.Source.Microphone),
  }));

  const { isMuted: isVideoMuted } = useIsMuted({
    sourceOrTrackRef: trackReference.value,
    participant: trackReference.value.participant,
  });
  const { isMuted: isAudioMuted } = useIsMuted({
    sourceOrTrackRef: micRef.value,
    participant: trackReference.value.participant,
  });
  const { isSpeaking } = useIsSpeaking({ participant: trackReference.value.participant });
  const { facingMode } = useFacingMode({ trackReference: trackReference.value });

  const attributes = computed<ParticipantTileAttributes>(() => ({
    'data-lk-audio-muted': isAudioMuted.value,
    'data-lk-video-muted': isVideoMuted.value,
    'data-lk-speaking': props.disableSpeakingIndicator === true ? false : isSpeaking.value,
    'data-lk-local-participant': trackReference.value.participant?.isLocal ?? false,
    'data-lk-source': trackReference.value.source ?? Track.Source.Unknown,
    'data-lk-facing-mode': facingMode.value,
  }));

  function onClick(): void {
    if (typeof props.onParticipantClick === 'function' && trackReference.value.participant) {
      const track =
        trackReference.value.publication ??
        trackReference.value.participant.getTrackPublication(trackReference.value.source);

      props.onParticipantClick({
        participant: trackReference.value.participant,
        track,
      });
    }
  }

  return { attributes, onClick };
}
