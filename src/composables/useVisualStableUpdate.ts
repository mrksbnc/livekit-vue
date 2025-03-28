import { updatePages, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { computed, ref, watch, type ShallowRef } from 'vue';

export interface UseVisualStableUpdateOptions {
  customSortFunction?: (
    trackReferences: TrackReferenceOrPlaceholder[],
  ) => TrackReferenceOrPlaceholder[];
}

export function useVisualStableUpdate(
  trackReferences: TrackReferenceOrPlaceholder[],
  maxItemsOnPage: number,
  options: UseVisualStableUpdateOptions = {},
): ShallowRef<TrackReferenceOrPlaceholder[]> {
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

  const updatedTrackReferences = ref<TrackReferenceOrPlaceholder[]>([
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

  return updatedTrackReferences as ShallowRef<TrackReferenceOrPlaceholder[]>;
}
