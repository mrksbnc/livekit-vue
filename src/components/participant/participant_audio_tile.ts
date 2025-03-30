import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import type { Participant } from 'livekit-client';

export type ParticipantAudioTileProps = {
  /** If provided, will override internal options for audio and metadata rendering */
  trackRef?: TrackReferenceOrPlaceholder;
  /** Preferred quality for the subscribed track */
  participant?: Participant;
  /** Display name for the participant, if not provided, name or identity is used */
  displayName?: string;
  /** Whether to render the speaking indicator */
  disableSpeakingIndicator?: boolean;
  /** Display an audio visualization for the current audio input */
  showAudioVisualizer?: boolean;
};
