import { updatePages, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { computed, ref, shallowRef, watch, type Ref, type ShallowRef } from 'vue';

export interface UseVisualStableUpdateOptions {
  customSortFunction?: (
    trackReferences: TrackReferenceOrPlaceholder[],
  ) => TrackReferenceOrPlaceholder[];
}

export type UseVisualStableUpdateArgs = {
  trackReferences: TrackReferenceOrPlaceholder[];
  maxItemsOnPage: number;
  options?: UseVisualStableUpdateOptions;
};

export type UseVisualStableUpdate = {
  isLayoutChanged: Ref<boolean>;
  sortedTrackReferences: Ref<TrackReferenceOrPlaceholder[]>;
  updatedTrackReferences: ShallowRef<TrackReferenceOrPlaceholder[]>;
};

export function useVisualStableUpdate({
  trackReferences,
  maxItemsOnPage,
  options = {},
}: UseVisualStableUpdateArgs): UseVisualStableUpdate {
  const lastMaxItemsOnPage = ref<number>(-1);
  const lastTrackRefs = ref<TrackReferenceOrPlaceholder[]>([]);

  const isLayoutChanged = computed<boolean>(() => {
    return maxItemsOnPage !== lastMaxItemsOnPage.value;
  });

  const sortedTrackReferences = computed<TrackReferenceOrPlaceholder[]>(() => {
    return options.customSortFunction
      ? options.customSortFunction(trackReferences)
      : trackReferences;
  });

  const updatedTrackReferences = shallowRef<TrackReferenceOrPlaceholder[]>([
    ...sortedTrackReferences.value,
  ]);

  function updateTrackReferences(): void {
    if (!isLayoutChanged.value) {
      try {
        updatedTrackReferences.value = updatePages(
          lastTrackRefs.value as TrackReferenceOrPlaceholder[],
          sortedTrackReferences.value,
          maxItemsOnPage,
        );
      } catch (error) {
        console.error('Error while running updatePages(): ', error);
      }
    }

    if (isLayoutChanged.value) {
      lastTrackRefs.value = sortedTrackReferences.value;
    } else {
      lastTrackRefs.value = updatedTrackReferences.value;
    }
    lastMaxItemsOnPage.value = maxItemsOnPage;
  }

  watch(() => sortedTrackReferences, updateTrackReferences);

  return {
    isLayoutChanged,
    sortedTrackReferences,
    updatedTrackReferences,
  };
}
