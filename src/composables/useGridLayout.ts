import {
  GRID_LAYOUTS,
  selectGridLayout,
  type GridLayoutDefinition,
  type GridLayoutInfo,
} from '@livekit/components-core';
import { useElementSize } from '@vueuse/core';
import { computed, watch, type ComputedRef, type Ref } from 'vue';

export type UseGridLayoutOptions = {
  layouts?: GridLayoutDefinition[];
};

export type UseGridLayout = {
  layout: ComputedRef<GridLayoutInfo>;
  containerWidth: Ref<number>;
  containerHeight: Ref<number>;
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

  watch([gridElement, layout], ([element, currentLayout]) => {
    if (element && currentLayout) {
      element.style.setProperty('--lk-col-count', currentLayout.columns.toString());
      element.style.setProperty('--lk-row-count', currentLayout.rows.toString());
    }
  });

  return {
    layout,
    containerWidth: width as Ref<number>,
    containerHeight: height as Ref<number>,
  };
}
