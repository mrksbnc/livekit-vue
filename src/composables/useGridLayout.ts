import {
  GRID_LAYOUTS,
  selectGridLayout,
  type GridLayoutDefinition,
  type GridLayoutInfo,
} from '@livekit/components-core';
import { useElementSize } from '@vueuse/core';
import { computed, watchEffect, type ComputedRef, type Ref } from 'vue';

export type UseGridLayoutProps = {
  trackCount: number;
  layouts?: GridLayoutDefinition[];
  gridElement: Ref<HTMLDivElement>;
};

export type UseGridLayout = {
  layout: ComputedRef<GridLayoutInfo>;
  containerWidth: Ref<number>;
  containerHeight: Ref<number>;
};

export function useGridLayout(props: UseGridLayoutProps): UseGridLayout {
  const { width, height } = useElementSize(props.gridElement);

  const gridLayouts = computed<GridLayoutDefinition[]>(() => {
    return props.layouts ?? GRID_LAYOUTS;
  });

  const layout = computed<GridLayoutInfo>(() => {
    return selectGridLayout(gridLayouts.value, props.trackCount, width.value, height.value);
  });

  watchEffect(() => {
    if (props.gridElement.value) {
      props.gridElement.value.style.setProperty('--lk-col-count', layout.value.columns.toString());
      props.gridElement.value.style.setProperty('--lk-row-count', layout.value.rows.toString());
    }
  });

  return {
    layout,
    containerWidth: width,
    containerHeight: height,
  };
}
