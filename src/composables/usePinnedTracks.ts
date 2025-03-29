import { useEnsureLayoutContext, type LayoutState } from '@/context/layout.context';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { computed, type ComputedRef } from 'vue';

export type UsePinnedTracks = {
  pinnedTracks: ComputedRef<TrackReferenceOrPlaceholder[]>;
};

export type UsePinnedTracksProps = {
  context?: LayoutState;
};

export function usePinnedTracks(props: UsePinnedTracksProps): UsePinnedTracks {
  const layoutContext = useEnsureLayoutContext(props.context);

  const pinnedTracks = computed<TrackReferenceOrPlaceholder[]>(() => {
    if (layoutContext.value?.pin.state !== undefined && layoutContext.value.pin.state.length >= 1) {
      return layoutContext.value.pin.state;
    }

    return [];
  });

  return {
    pinnedTracks,
  };
}
