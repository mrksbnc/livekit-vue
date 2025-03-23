import { useEnsureLayoutContext } from '@/context/layout.context';
import type { PinContext } from '@/context/pin.context';
import { type PinState } from '@livekit/components-core';
import { computed, type HTMLAttributes, type ShallowRef } from 'vue';

export type UseClearButtonReturnType = {
  elementProps: ShallowRef<HTMLAttributes>;
};

export function useClearPinButton(props: HTMLAttributes): UseClearButtonReturnType {
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

  const elementProps = computed<HTMLAttributes>(() => {
    return {
      ...props,
      class: 'lk-clear-pin-button',
      disabled: !state.value?.length,
      onClick: () => {
        if (dispatch.value) {
          dispatch.value({ msg: 'clear_pin' });
        }
      },
    };
  });

  return {
    elementProps,
  };
}
