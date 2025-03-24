import { useEnsureLayoutContext } from '@/context/layout.context';
import type { PinContext } from '@/context/pin.context';
import { type PinState } from '@livekit/components-core';
import { computed, type Ref } from 'vue';

export type UseClearPinButton = {
  disabled: Ref<boolean>;
  onClick: () => void;
};

export function useClearPinButton(): UseClearPinButton {
  const layoutContext = useEnsureLayoutContext();

  const pinState = computed<PinContext>(() => {
    return layoutContext.value.pin;
  });

  const state = computed<PinState>(() => {
    return pinState.value.state;
  });

  const dispatch = computed<PinContext['dispatch']>(() => {
    return pinState.value.dispatch;
  });

  const disabled = computed<boolean>(() => {
    return !state.value?.length;
  });

  function onClick() {
    if (dispatch.value) {
      dispatch.value({ msg: 'clear_pin' });
    }
  }

  return {
    disabled,
    onClick,
  };
}
