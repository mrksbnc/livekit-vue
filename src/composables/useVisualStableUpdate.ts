import { updatePages, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import {
  computed,
  ref,
  shallowRef,
  watch,
  watchEffect,
  type ComputedRef,
  type MaybeRef,
  type ShallowRef,
} from 'vue';

export type UseVisualStableUpdateOptions = {
  trackReferences: TrackReferenceOrPlaceholder[] | MaybeRef<TrackReferenceOrPlaceholder[]>;
  maxItemsOnPage: number;
  customSortFunction?: (
    trackReferences: TrackReferenceOrPlaceholder[],
  ) => TrackReferenceOrPlaceholder[];
};

export type UseVisualStableUpdate = {
  isLayoutChanged: ComputedRef<boolean>;
  sortedTrackReferences: ComputedRef<TrackReferenceOrPlaceholder[]>;
  updatedTrackReferences: ShallowRef<TrackReferenceOrPlaceholder[]>;
};

export function useVisualStableUpdate(
  options: UseVisualStableUpdateOptions,
): UseVisualStableUpdate {
  const lastMaxItemsOnPage = ref<number>(-1);
  const lastTrackRefs = shallowRef<TrackReferenceOrPlaceholder[]>([]);

  const trackReferences = computed<TrackReferenceOrPlaceholder[]>(() => {
    return 'value' in options.trackReferences
      ? options.trackReferences.value
      : options.trackReferences;
  });

  const isLayoutChanged = computed<boolean>(() => {
    return options.maxItemsOnPage !== lastMaxItemsOnPage.value;
  });

  const sortedTrackReferences = computed<TrackReferenceOrPlaceholder[]>(() => {
    return options.customSortFunction
      ? options.customSortFunction(trackReferences.value)
      : trackReferences.value;
  });

  const updatedTrackReferences = shallowRef<TrackReferenceOrPlaceholder[]>([
    ...sortedTrackReferences.value,
  ]);

  function updateTrackReferences(): void {
    if (!isLayoutChanged.value) {
      try {
        updatedTrackReferences.value = updatePages(
          lastTrackRefs.value,
          sortedTrackReferences.value,
          options.maxItemsOnPage,
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
    lastMaxItemsOnPage.value = options.maxItemsOnPage;
  }

  watchEffect(() => {
    if (isLayoutChanged.value) {
      updateTrackReferences();
    }
  });

  watch([() => options.maxItemsOnPage, trackReferences], () => {
    updateTrackReferences();
  });

  return {
    isLayoutChanged,
    sortedTrackReferences,
    updatedTrackReferences,
  };
}
