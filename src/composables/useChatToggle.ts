import { useEnsureLayoutContext } from '@/context/layout.context';
import { computed, type ComputedRef } from 'vue';

export type ChatToggleAttributes = {
  'aria-pressed': string;
};

export type UseChatToggle = {
  isVisible: ComputedRef<boolean>;
  toggle: () => void;
  show: () => void;
  hide: () => void;
  unreadCount: ComputedRef<number>;
  attributes: ComputedRef<ChatToggleAttributes>;
};

export function useChatToggle(): UseChatToggle {
  const layoutContext = useEnsureLayoutContext();

  const isVisible = computed<boolean>(() => {
    const widgetState = layoutContext.value.widget.state.value;
    return !!widgetState.showChat;
  });

  const unreadCount = computed<number>(() => {
    const widgetState = layoutContext.value.widget.state.value;
    return widgetState.unreadMessages ?? 0;
  });

  const attributes = computed<ChatToggleAttributes>(() => {
    return {
      'aria-pressed': `${isVisible.value}`,
    };
  });

  const toggle = (): void => {
    layoutContext.value.widget.dispatch({ msg: 'toggle_chat' });
  };

  const show = (): void => {
    layoutContext.value.widget.dispatch({ msg: 'show_chat' });
  };

  const hide = (): void => {
    layoutContext.value.widget.dispatch({ msg: 'hide_chat' });
  };

  return {
    isVisible,
    toggle,
    show,
    hide,
    unreadCount,
    attributes,
  };
}
