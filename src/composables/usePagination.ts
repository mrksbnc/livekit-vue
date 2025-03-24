import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { computed, onMounted, ref, type Ref } from 'vue';
import { useVisualStableUpdate } from './useVisualStableUpdate';

export type UsePagination = {
  totalPageCount: Ref<number>;
  firstItemIndex: Ref<number>;
  lastItemIndex: Ref<number>;
  tracks: Ref<TrackReferenceOrPlaceholder[]>;
  currentPage: Ref<number>;
  nextPage: () => number;
  prevPage: () => number;
  setPage: (num: number) => void;
};

export function usePagination(
  itemPerPage: number,
  trackReferences: TrackReferenceOrPlaceholder[],
): UsePagination {
  const currentPage = ref<number>(1);
  const totalPageCount = ref(Math.max(Math.ceil(trackReferences.length / itemPerPage), 1));
  const lastItemIndex = ref(currentPage.value * itemPerPage);
  const firstItemIndex = ref(lastItemIndex.value - itemPerPage);

  const changePage = (direction: 'next' | 'previous') => {
    if (direction === 'next') {
      if (currentPage.value === totalPageCount.value) {
        return currentPage.value;
      }
      return currentPage.value + 1;
    } else {
      if (currentPage.value === 1) {
        return currentPage.value;
      }
      return currentPage.value - 1;
    }
  };

  const goToPage = (num: number) => {
    if (num > totalPageCount.value) {
      currentPage.value = totalPageCount.value;
    } else if (num < 1) {
      currentPage.value = 1;
    } else {
      currentPage.value = num;
    }
  };

  const updatedTrackReferences = useVisualStableUpdate(trackReferences, itemPerPage);

  const tracksOnPage = computed<TrackReferenceOrPlaceholder[]>(() => {
    return updatedTrackReferences.value.slice(firstItemIndex.value, lastItemIndex.value);
  });

  onMounted(() => {
    if (currentPage.value > totalPageCount.value) {
      currentPage.value = totalPageCount.value;
    }
  });

  return {
    totalPageCount,
    nextPage: () => changePage('next'),
    prevPage: () => changePage('previous'),
    setPage: goToPage,
    firstItemIndex,
    lastItemIndex,
    tracks: tracksOnPage,
    currentPage,
  };
}
