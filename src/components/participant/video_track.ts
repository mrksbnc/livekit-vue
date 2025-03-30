import type { ParticipantClickEvent, TrackReference } from '@livekit/components-core';
import type { VideoHTMLAttributes } from 'vue';

export type VideoTrackProps = {
  trackRef?: TrackReference;
  onClick?: (evt: MouseEvent) => void;
  onTrackClick?: (evt: ParticipantClickEvent) => void;
  onSubscriptionStatusChanged?: (subscribed: boolean) => void;
  manageSubscription?: boolean;
  attrs?: VideoHTMLAttributes;
};

export enum VideoTrackEvent {
  TrackClick = 'track-click',
  SubscriptionStatusChanged = 'subscription-status-changed',
}
