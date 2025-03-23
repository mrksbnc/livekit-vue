import { useEnsureLayoutContext, type LayoutState } from '@/context/layout.context';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { computed, type ShallowRef } from 'vue';

export function usePinnedTracks(context?: LayoutState): ShallowRef<TrackReferenceOrPlaceholder[]> {
  const layoutContext = useEnsureLayoutContext(context);

  const pinState = computed<TrackReferenceOrPlaceholder[]>(() => {
    if (layoutContext.value?.pin.state !== undefined && layoutContext.value.pin.state.length >= 1) {
      return layoutContext.value.pin.state;
    }
    return [];
  });

  return pinState;
}
