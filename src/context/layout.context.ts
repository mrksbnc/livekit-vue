import type { PinState, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { createInjectionState } from '@vueuse/core';
import { shallowRef, type ShallowRef } from 'vue';
import { usePinContext } from './pin.context';
import { useWidgetContext } from './widget.context';

export type LayoutContextAction =
  | {
      msg: 'set_pin';
      trackReference: TrackReferenceOrPlaceholder;
    }
  | { msg: 'clear_pin' }
  | { msg: 'toggle_settings' };

export function pinReducer(state: PinState, action: LayoutContextAction): PinState {
  if (action.msg === 'set_pin') {
    return [action.trackReference];
  } else if (action.msg === 'clear_pin') {
    return [];
  } else {
    return { ...state };
  }
}

export type LayoutState = {
  pin: ReturnType<typeof usePinContext>;
  widget: ReturnType<typeof useWidgetContext>;
};

const [useProvideLayoutContext, useLayoutContext] = createInjectionState(
  (initialValue: LayoutState): ShallowRef<LayoutState> => {
    const state = shallowRef(initialValue);

    return state;
  },
);

export { useLayoutContext, useProvideLayoutContext };

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

export function useCreateLayoutContext(): LayoutState {
  return {
    pin: usePinContext(),
    widget: useWidgetContext(),
  };
}

export function useEnsureCreateLayoutContext(layoutContext?: LayoutState) {
  return shallowRef(layoutContext) ?? useCreateLayoutContext();
}
