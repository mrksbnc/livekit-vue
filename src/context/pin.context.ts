import type { PinState } from '@livekit/components-core';
import { createInjectionState } from '@vueuse/core';
import { shallowRef } from 'vue';
import { type LayoutContextAction } from './layout.context';

export type PinContext = {
  state: PinState;
  dispatch: (action: LayoutContextAction) => void;
};

export function pinReducer(state: PinState, action: LayoutContextAction): PinState {
  if (action.msg === 'set_pin') {
    return [action.trackReference];
  } else if (action.msg === 'clear_pin') {
    return [];
  } else {
    return [...state];
  }
}

const [useProvidePinContext, usePinContext] = createInjectionState((initialValue: PinState) => {
  const state = shallowRef<PinState>(initialValue ?? []);

  function dispatch(action: LayoutContextAction) {
    state.value = pinReducer(state.value, action);
  }

  return {
    state,
    dispatch,
  };
});

export { usePinContext, useProvidePinContext };

export const useEnsurePinContext = (pinContext?: PinState) => {
  const pc = pinContext ? shallowRef(pinContext) : usePinContext();

  if (!pc) {
    throw Error('Tried to access PinContext context outside a PinContextProvider provider.');
  }
  return pc;
};
