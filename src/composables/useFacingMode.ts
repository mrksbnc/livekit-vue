import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { facingModeFromLocalTrack, LocalTrackPublication } from 'livekit-client';
import { ref, watch, type ShallowRef } from 'vue';

export enum FacingMode {
  User = 'user',
  Environment = 'environment',
  Left = 'left',
  Right = 'right',
  Undefined = 'undefined',
}

export function useFacingMode(trackReference: TrackReferenceOrPlaceholder): ShallowRef<FacingMode> {
  const state = ref<FacingMode>(FacingMode.Undefined);

  watch(trackReference, () => {
    if (trackReference.publication instanceof LocalTrackPublication) {
      const localTrack = trackReference.publication.track;
      if (localTrack) {
        const { facingMode } = facingModeFromLocalTrack(localTrack);
        state.value = FacingMode[facingMode as keyof typeof FacingMode];
      }
    }
    return state.value;
  });

  return state;
}
