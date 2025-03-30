import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { Track } from 'livekit-client';

export type TrackMutedIndicatorProps = {
  /** The track reference to observe. */
  trackRef?: TrackReferenceOrPlaceholder;
  /** The participant to observe for events. If track source is provided, a suitable track will be selected. */
  participant?: Participant;
  /** Source of the track to observe if no trackRef is passed. Used in conjunction with the participant property. */
  source?: Track.Source;
};
