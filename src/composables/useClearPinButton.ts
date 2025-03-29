import { useEnsureLayoutContext } from '@/context/layout.context';
import type { PinContext } from '@/context/pin.context';
import { type PinState } from '@livekit/components-core';
import { computed, type Ref } from 'vue';

export type ClearPinButtonProps = {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export type UseClearPinButton = {
  buttonProps: Ref<{
    disabled: boolean;
    onClick: () => void;
  }>;
};

export function useClearPinButton(props: ClearPinButtonProps = {}): UseClearPinButton {
  const layoutContext = useEnsureLayoutContext();

  const pinContext = computed<PinContext>(() => layoutContext.value.pin);

  const pinState = computed<PinState | undefined>(() => pinContext.value.state);
  const dispatch = computed<PinContext['dispatch']>(() => pinContext.value.dispatch);

  const buttonProps = computed<{ disabled: boolean; onClick: () => void }>(() => {
    const isDisabled = !pinState.value?.length || props.disabled || false;

    const handleClick = (): void => {
      if (dispatch.value) {
        dispatch.value({ msg: 'clear_pin' });
      }

      if (props.onClick) {
        props.onClick();
      }
    };

    return {
      disabled: isDisabled,
      onClick: handleClick,
    };
  });

  return {
    buttonProps,
  };
}
