import type { TrackReference } from '@livekit/components-core';

export type AudioTrackProps = {
  trackRef?: TrackReference;
  onSubscriptionStatusChanged?: (subscribed: boolean) => void;
  volume?: number;
  muted?: boolean;
};
