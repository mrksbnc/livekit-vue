import type { HTMLAttributes } from 'vue';

export type UseSettingsToggleProps = {
  props: HTMLAttributes;
};

// TODO: implement when layoutContext is done

export function useSettingsToggle({ props }: UseSettingsToggleProps) {
  const className = 'lk-settings-toggle';

  const mergedProps = {
    ...props,
  };
}
