import { createInjectionState } from '@vueuse/core';
import { shallowRef, type ShallowRef } from 'vue';
import { usePinContext, type PinContextType } from './pin.context';
import { useWidgetContext, type WidgetContextType } from './widget.context';

export type LayoutState = {
  pin: PinContextType;
  widget: WidgetContextType;
};

const [useProvideLayoutContext, useLayoutContext] = createInjectionState(
  (initialValue: LayoutState): Readonly<ShallowRef<LayoutState>> => {
    const state = shallowRef(initialValue);

    return state;
  },
);

export function useMaybeLayoutContext(): ShallowRef<LayoutState> | undefined {
  return useLayoutContext();
}

export function useEnsureLayoutContext(layoutContext?: LayoutState) {
  const lc = layoutContext ? shallowRef(layoutContext) : useLayoutContext();

  if (!lc) {
    throw Error('Tried to access LayoutContext context outside a LayoutContextProvider provider.');
  }
  return lc;
}

export function useCreateLayoutContext() {
  return {
    pin: usePinContext(),
    widget: useWidgetContext(),
  };
}

export function useEnsureCreateLayoutContext(layoutContext?: {
  pin: PinContextType;
  widget: WidgetContextType;
}) {
  return shallowRef(layoutContext) ?? useCreateLayoutContext();
}
