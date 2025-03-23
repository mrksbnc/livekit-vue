import {
  GRID_LAYOUTS,
  selectGridLayout,
  type GridLayoutDefinition,
} from '@livekit/components-core';
import { useElementSize } from '@vueuse/core';
import { computed, watch, type Ref, type ShallowRef } from 'vue';

export type UseGridLayoutReturnType = {
  layout: ShallowRef<GridLayoutDefinition | undefined>;
  containerWidth: ShallowRef<number | undefined>;
  containerHeight: ShallowRef<number | undefined>;
};

export function useGridLayout(
  gridElement: Ref<HTMLDivElement>,
  trackCount: number,
  options: {
    gridLayouts?: GridLayoutDefinition[];
  } = {},
): UseGridLayoutReturnType {
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
