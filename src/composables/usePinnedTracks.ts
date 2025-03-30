import { useEnsureLayoutContext, type LayoutContext } from '@/context/layout.context';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { computed, type ComputedRef } from 'vue';

export type UsePinnedTracks = {
  pinnedTracks: ComputedRef<TrackReferenceOrPlaceholder[]>;
};

export type UsePinnedTracksProps = {
  context?: LayoutContext;
};

export function usePinnedTracks(props: UsePinnedTracksProps): UsePinnedTracks {
  const layoutContext = useEnsureLayoutContext(props.context);

  const pinnedTracks = computed<TrackReferenceOrPlaceholder[]>(() => {
    const pinState = layoutContext.value?.pin.state.value;

    if (pinState !== undefined && pinState.length >= 1) {
      return pinState;
    }

    return [];
  });

  return {
    pinnedTracks,
  };
}
