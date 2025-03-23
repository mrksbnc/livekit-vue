import {
  GRID_LAYOUTS,
  selectGridLayout,
  type GridLayoutDefinition,
} from '@livekit/components-core';
import { useElementSize } from '@vueuse/core';
import { computed, watch, type Ref } from 'vue';

export function useGridLayout(
  /** HTML element that contains the grid. */
  gridElement: Ref<HTMLDivElement>,
  /** Count of tracks that should get layed out */
  trackCount: number,
  options: {
    gridLayouts?: GridLayoutDefinition[];
  } = {},
) {
  const { width, height } = useElementSize(gridElement);

  const gridLayouts = computed<GridLayoutDefinition[]>(() => {
    return options.gridLayouts ?? GRID_LAYOUTS;
  });

  const layout = computed(() => {
    return selectGridLayout(gridLayouts.value, trackCount, width.value, height.value);
  });

  watch([gridElement, layout], () => {
    if (gridElement.value && layout) {
      gridElement.value.style.setProperty('--lk-col-count', layout.value?.columns.toString());
      gridElement.value.style.setProperty('--lk-row-count', layout.value?.rows.toString());
    }
  });

  return {
    layout,
    containerWidth: width,
    containerHeight: height,
  };
}
