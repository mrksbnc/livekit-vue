import type { TrackReference } from '@livekit/components-core';

export type AudioVisualizerProps = {
  trackRef?: TrackReference;
};

export enum AudioVisualizerEvent {
  VolumeChanged = 'volume-changed',
}
