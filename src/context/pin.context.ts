import type { PinState, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { createInjectionState } from '@vueuse/core';
import { shallowRef, type ShallowRef } from 'vue';

export type PinContextAction =
  | {
      msg: 'set_pin';
      trackReference: TrackReferenceOrPlaceholder;
    }
  | { msg: 'clear_pin' };

export interface PinContext {
  state: ShallowRef<PinState>;
  dispatch: (action: PinContextAction) => void;
}

export function pinReducer(state: PinState, action: PinContextAction): PinState {
  if (action.msg === 'set_pin') {
    return [action.trackReference];
  } else if (action.msg === 'clear_pin') {
    return [];
  } else {
    return [...state];
  }
}

const [useProvidePinContext, usePinContextRaw] = createInjectionState(
  (initialValue?: PinState): PinContext => {
    const state = shallowRef<PinState>(initialValue ?? []);

    function dispatch(action: PinContextAction): void {
      state.value = pinReducer(state.value, action);
    }

    return {
      state,
      dispatch,
    };
  },
);

export { usePinContextRaw, useProvidePinContext };

export function usePinContext(): PinContext {
  const context = usePinContextRaw();
  if (!context) {
    throw new Error(
      'Pin context not found. Make sure you have a PinContextProvider in your component tree.',
    );
  }
  return context;
}

export function useMaybePinContext(): PinContext | undefined {
  return usePinContextRaw();
}

export function useEnsurePinContext(pinContext?: PinContext): PinContext {
  if (pinContext) {
    return pinContext;
  }

  return usePinContext();
}
