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

export type UseVisualStableUpdateProps = {
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

export function useVisualStableUpdate(props: UseVisualStableUpdateProps): UseVisualStableUpdate {
  const lastMaxItemsOnPage = ref<number>(-1);
  const lastTrackRefs = shallowRef<TrackReferenceOrPlaceholder[]>([]);

  const trackReferences = computed<TrackReferenceOrPlaceholder[]>(() => {
    return 'value' in props.trackReferences ? props.trackReferences.value : props.trackReferences;
  });

  const isLayoutChanged = computed<boolean>(() => {
    return props.maxItemsOnPage !== lastMaxItemsOnPage.value;
  });

  const sortedTrackReferences = computed<TrackReferenceOrPlaceholder[]>(() => {
    return props.customSortFunction
      ? props.customSortFunction(trackReferences.value)
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
          props.maxItemsOnPage,
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
    lastMaxItemsOnPage.value = props.maxItemsOnPage;
  }

  watchEffect(() => {
    if (isLayoutChanged.value) {
      updateTrackReferences();
    }
  });

  watch([() => props.maxItemsOnPage, trackReferences], () => {
    updateTrackReferences();
  });

  return {
    isLayoutChanged,
    sortedTrackReferences,
    updatedTrackReferences,
  };
}
