import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { facingModeFromLocalTrack, LocalTrackPublication } from 'livekit-client';
import { ref, watch, type ShallowRef } from 'vue';

export function useFacingMode(
  trackReference: TrackReferenceOrPlaceholder,
): ShallowRef<'user' | 'environment' | 'left' | 'right' | 'undefined'> {
  const state = ref<'user' | 'environment' | 'left' | 'right' | 'undefined'>('undefined');

  watch(trackReference, () => {
    if (trackReference.publication instanceof LocalTrackPublication) {
      const localTrack = trackReference.publication.track;
      if (localTrack) {
        const { facingMode } = facingModeFromLocalTrack(localTrack);
        state.value = facingMode;
      }
    }
    return state.value;
  });

  return state;
}
