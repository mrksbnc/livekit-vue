import { useEnsureTrackRef } from '@/context/track_reference.context';
import type { ParticipantClickEvent, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { Track, TrackPublication } from 'livekit-client';
import { computed, type Ref } from 'vue';
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
  attributes: Ref<ParticipantTileAttributes>;
  onClick: (event: ParticipantClickEvent) => void;
};

export function useParticipantTile(options: UseParticipantTileProps): UseParticipantTile {
  const trackReference = useEnsureTrackRef(options.trackRef);

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

  const { isMuted: isVideoMuted } = useIsMuted(trackReference.value);
  const { isMuted: isAudioMuted } = useIsMuted(micRef.value);
  const { isSpeaking } = useIsSpeaking(trackReference.value.participant);
  const { facingMode } = useFacingMode(trackReference.value);

  const attributes = computed<ParticipantTileAttributes>(() => {
    const attr: ParticipantTileAttributes = {
      'data-lk-audio-muted': isAudioMuted.value,
      'data-lk-video-muted': isVideoMuted.value,
      'data-lk-speaking': options.disableSpeakingIndicator === true ? false : isSpeaking.value,
      'data-lk-local-participant': trackReference.value.participant.isLocal,
      'data-lk-source': trackReference.value.source,
      'data-lk-facing-mode': facingMode.value,
    };

    return attr;
  });

  function onClick(event: ParticipantClickEvent) {
    if (typeof options.onParticipantClick === 'function') {
      const track =
        trackReference.value.publication ??
        trackReference.value.participant.getTrackPublication(trackReference.value.source);

      options.onParticipantClick({ participant: trackReference.value.participant, track });
    }
  }

  return {
    attributes,
    onClick,
  };
}
