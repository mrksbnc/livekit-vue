import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { facingModeFromLocalTrack, LocalTrackPublication } from 'livekit-client';
import { computed, type ComputedRef } from 'vue';

export enum FacingMode {
  User = 'user',
  Environment = 'environment',
  Left = 'left',
  Right = 'right',
  Undefined = 'undefined',
}

export type UseFacingMode = {
  facingMode: ComputedRef<FacingMode>;
};

export type FacingModeProps = {
  trackReference: TrackReferenceOrPlaceholder;
};

export function useFacingMode(props: FacingModeProps): UseFacingMode {
  const facingMode = computed<FacingMode>(() => {
    const { trackReference } = props;

    if (trackReference.publication instanceof LocalTrackPublication) {
      const localTrack = trackReference.publication.track;

      if (localTrack) {
        const { facingMode: trackFacingMode } = facingModeFromLocalTrack(localTrack);
        return FacingMode[trackFacingMode as keyof typeof FacingMode] || FacingMode.Undefined;
      }
    }

    return FacingMode.Undefined;
  });

  return {
    facingMode,
  };
}
