import { useEnsureLayoutContext } from '@/context/layout.context';
import type { PinContext } from '@/context/pin.context';
import { computed, toRefs, type Ref } from 'vue';

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

  const { state: pinState, dispatch } = toRefs(pinContext.value);

  const buttonProps = computed<{ disabled: boolean; onClick: () => void }>(() => {
    const isDisabled = !pinState.value?.length || props.disabled || false;

    const handleClick = (): void => {
      dispatch.value({ msg: 'clear_pin' });

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
