import type { WidgetState } from '@livekit/components-core';
import { createInjectionState } from '@vueuse/core';
import { shallowRef, type ShallowRef } from 'vue';

export type WidgetContextType = {
  state?: WidgetState;
};

const [useProvideWidgetContext, useWidgetContext] = createInjectionState(
  (initialValue: WidgetState): ShallowRef<WidgetState> => {
    const state = shallowRef(initialValue);

    return state;
  },
);

export { useProvideWidgetContext, useWidgetContext };
