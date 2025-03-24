import { useEnsureLayoutContext, type LayoutState } from '@/context/layout.context';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { computed, type Ref } from 'vue';

export type UsePinnedTracks = {
  pinnedTracks: Ref<TrackReferenceOrPlaceholder[]>;
};

export function usePinnedTracks(context?: LayoutState): UsePinnedTracks {
  const layoutContext = useEnsureLayoutContext(context);

  const pinState = computed<TrackReferenceOrPlaceholder[]>(() => {
    if (layoutContext.value?.pin.state !== undefined && layoutContext.value.pin.state.length >= 1) {
      return layoutContext.value.pin.state;
    }
    return [];
  });

  return {
    pinnedTracks: pinState,
  };
}
