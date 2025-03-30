import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { computed, ref, watchEffect, type ComputedRef, type MaybeRef, type Ref } from 'vue';
import { useVisualStableUpdate, type UseVisualStableUpdateProps } from './useVisualStableUpdate';

export type UsePaginationOptions = {
  customSortFunction?: UseVisualStableUpdateProps['customSortFunction'];
  /**
   * Initial page to show (defaults to 1)
   */
  initialPage?: number;
};

export enum PaginationDirection {
  Next = 'next',
  Previous = 'previous',
}

export type UsePagination = {
  totalPageCount: Ref<number>;
  firstItemIndex: Ref<number>;
  lastItemIndex: Ref<number>;
  tracks: ComputedRef<TrackReferenceOrPlaceholder[]>;
  currentPage: Ref<number>;
  nextPage: () => void;
  prevPage: () => void;
  setPage: (num: number) => void;
  hasNextPage: ComputedRef<boolean>;
  hasPrevPage: ComputedRef<boolean>;
  totalItems: ComputedRef<number>;
};

export function usePagination(
  itemPerPage: number,
  trackReferences: TrackReferenceOrPlaceholder[] | MaybeRef<TrackReferenceOrPlaceholder[]>,
  options: UsePaginationOptions = {},
): UsePagination {
  // Ensure itemPerPage is at least 1
  itemPerPage = Math.max(1, itemPerPage);

  const currentPage = ref<number>(options.initialPage ? Math.max(1, options.initialPage) : 1);

  const getTrackReferences = computed<TrackReferenceOrPlaceholder[]>(() => {
    if ('value' in trackReferences) {
      return trackReferences.value;
    } else {
      return trackReferences;
    }
  });

  const totalItems = computed<number>(() => getTrackReferences.value.length);
  const totalPageCount = computed<number>(() =>
    Math.max(Math.ceil(totalItems.value / itemPerPage), 1),
  );
  const lastItemIndex = computed<number>(() =>
    Math.min(currentPage.value * itemPerPage, totalItems.value),
  );
  const firstItemIndex = computed<number>(() => Math.max(0, lastItemIndex.value - itemPerPage));
  const hasNextPage = computed<boolean>(() => currentPage.value < totalPageCount.value);
  const hasPrevPage = computed<boolean>(() => currentPage.value > 1);

  const tracksOnPage = computed<TrackReferenceOrPlaceholder[]>(() => {
    return updatedTrackReferences.value.slice(firstItemIndex.value, lastItemIndex.value);
  });

  watchEffect(() => {
    const maxPage = totalPageCount.value;
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage;
    } else if (currentPage.value < 1) {
      currentPage.value = 1;
    }
  });

  const nextPage = (): void => {
    if (hasNextPage.value) {
      currentPage.value += 1;
    }
  };

  const prevPage = (): void => {
    if (hasPrevPage.value) {
      currentPage.value -= 1;
    }
  };

  const setPage = (num: number): void => {
    currentPage.value = Math.min(Math.max(1, num), totalPageCount.value);
  };

  const { updatedTrackReferences } = useVisualStableUpdate({
    trackReferences: getTrackReferences,
    maxItemsOnPage: itemPerPage,
    customSortFunction: options.customSortFunction,
  });

  return {
    totalPageCount,
    nextPage,
    prevPage,
    setPage,
    firstItemIndex,
    lastItemIndex,
    tracks: tracksOnPage,
    currentPage,
    hasNextPage,
    hasPrevPage,
    totalItems,
  };
}
