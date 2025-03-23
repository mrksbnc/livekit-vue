import type { PinState, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { createInjectionState } from '@vueuse/core';
import { shallowRef } from 'vue';

export type PinAction =
  | {
      msg: 'set_pin';
      trackReference: TrackReferenceOrPlaceholder;
    }
  | { msg: 'clear_pin' }
  | { msg: 'toggle_settings' };

export type PinContext = {
  state: PinState;
  dispatch?: (action: PinAction) => void;
};

export function pinReducer(state: PinState, action: PinAction): PinState {
  if (action.msg === 'set_pin') {
    return [action.trackReference];
  } else if (action.msg === 'clear_pin') {
    return [];
  } else {
    return { ...state };
  }
}

const [useProvidePinContext, usePinContext] = createInjectionState((initialValue: PinState) => {
  const state = shallowRef(initialValue);

  function dispatch(action: PinAction) {
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
