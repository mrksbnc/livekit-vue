import type { ParticipantClickEvent, TrackReference } from '@livekit/components-core';
import type { HTMLAttributes } from 'vue';

export type VideoTrackProps = {
  trackRef?: TrackReference;
  onClick?: (evt: MouseEvent) => void;
  onTrackClick?: (evt: ParticipantClickEvent) => void;
  onSubscriptionStatusChanged?: (subscribed: boolean) => void;
  manageSubscription?: boolean;
  attrs?: HTMLAttributes;
};
