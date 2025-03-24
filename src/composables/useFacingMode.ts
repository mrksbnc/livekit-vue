import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { facingModeFromLocalTrack, LocalTrackPublication } from 'livekit-client';
import { ref, watch, type Ref } from 'vue';

export type UseFacingMode = {
  facingMode: Ref<FacingMode>;
};

export enum FacingMode {
  User = 'user',
  Environment = 'environment',
  Left = 'left',
  Right = 'right',
  Undefined = 'undefined',
}

export function useFacingMode(trackReference: TrackReferenceOrPlaceholder): UseFacingMode {
  const facing = ref<FacingMode>(FacingMode.Undefined);

  watch(trackReference, () => {
    if (trackReference.publication instanceof LocalTrackPublication) {
      const localTrack = trackReference.publication.track;
      if (localTrack) {
        const { facingMode } = facingModeFromLocalTrack(localTrack);
        facing.value = FacingMode[facingMode as keyof typeof FacingMode];
      }
    }
    return facing.value;
  });

  return {
    facingMode: facing,
  };
}
