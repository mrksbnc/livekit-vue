import { useCreateLayoutContext } from '@/context/layout.context';
import { computed, type ComputedRef } from 'vue';

export type SettingsToggleAttributes = {
  'aria-pressed': string;
};

export type UseSettingsToggle = {
  isVisible: ComputedRef<boolean>;
  toggle: () => void;
  attributes: ComputedRef<SettingsToggleAttributes>;
};

export function useSettingsToggle(): UseSettingsToggle {
  const layoutContext = useCreateLayoutContext();

  const isVisible = computed<boolean>(() => {
    const widgetState = layoutContext.widget.state.value;
    return !!widgetState.showSettings;
  });

  const toggle = (): void => {
    layoutContext.widget.dispatch({ msg: 'toggle_settings' });
  };

  const attributes = computed<SettingsToggleAttributes>(() => {
    return {
      'aria-pressed': `${isVisible.value}`,
    };
  });

  return {
    isVisible,
    toggle,
    attributes,
  };
}
