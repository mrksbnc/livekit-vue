import {
  GRID_LAYOUTS,
  selectGridLayout,
  type GridLayoutDefinition,
  type GridLayoutInfo,
} from '@livekit/components-core';
import { useElementSize } from '@vueuse/core';
import { computed, watch, type Ref } from 'vue';

export type UseGridLayoutOptions = {
  layouts?: GridLayoutDefinition[];
};

export type UseGridLayout = {
  layout: Ref<GridLayoutDefinition | undefined>;
  containerWidth: Ref<number | undefined>;
  containerHeight: Ref<number | undefined>;
};

export function useGridLayout(
  gridElement: Ref<HTMLDivElement>,
  trackCount: number,
  options: UseGridLayoutOptions = {
    layouts: [],
  },
): UseGridLayout {
  const { width, height } = useElementSize(gridElement);

  const gridLayouts = computed<GridLayoutDefinition[]>(() => {
    return options.layouts ?? GRID_LAYOUTS;
  });

  const layout = computed<GridLayoutInfo>(() => {
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
