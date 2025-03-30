import type { ParticipantClickEvent, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { Track } from 'livekit-client';

export type ParticipantTileProps = {
  /** The track reference to display. */
  trackRef?: TrackReferenceOrPlaceholder;
  /** Automatically manage subscriptions based on visibility. */
  autoManageSubscription?: boolean;
  /** Toggle the display of the participant's audio level. */
  showAudioLevel?: boolean;
  /** Toggle the display of the participant's connection quality. */
  showConnectionQuality?: boolean;
  /** Toggle the display of the participant's screen share, if they're sharing their screen. */
  showParticipantScreenShare?: boolean;
  /** Override the display name of the participant. */
  displayName?: string;
  /** Disable the speaking indicator functionality. */
  disableSpeakingIndicator?: boolean;
  /** Callback when a participant is clicked. */
  onParticipantClick?: (event: ParticipantClickEvent) => void;
  /** If true, will hide the default mute icon and allow for custom behavior. */
  hideDefaultAudioMutedIndicator?: boolean;
  /** If true, will hide the default mute icon and allow for custom behavior. */
  hideDefaultVideoMutedIndicator?: boolean;
  /** Source to show on participant tile. Will be ignored if track ref is provided */
  source?: Track.Source.Camera | Track.Source.Microphone | Track.Source.ScreenShare;
  /** The participant to display. Used in conjunction with source. */
  participant?: Participant;
};
