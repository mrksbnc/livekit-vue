import type { WidgetState } from '@livekit/components-core';
import { createInjectionState } from '@vueuse/core';
import { shallowRef, type ShallowRef } from 'vue';

export type WidgetContextAction =
  | { msg: 'show_chat' }
  | { msg: 'hide_chat' }
  | { msg: 'toggle_chat' }
  | { msg: 'unread_msg'; count: number }
  | { msg: 'toggle_settings' };

export function widgetReducer(state: WidgetState, action: WidgetContextAction): WidgetState {
  if (action.msg === 'toggle_settings') {
    return { ...state, showSettings: !state.showSettings };
  } else if (action.msg === 'show_chat') {
    return { ...state, showChat: true, unreadMessages: 0 };
  } else if (action.msg === 'hide_chat') {
    return { ...state, showChat: false };
  } else if (action.msg === 'toggle_chat') {
    const newState = { ...state, showChat: !state.showChat };
    if (newState.showChat === true) {
      newState.unreadMessages = 0;
    }
    return newState;
  } else if (action.msg === 'unread_msg' && 'count' in action) {
    return { ...state, unreadMessages: action.count };
  }
  return { ...state };
}

export interface WidgetContext {
  state: ShallowRef<WidgetState>;
  dispatch: (action: WidgetContextAction) => void;
}

const defaultState: WidgetState = {
  showSettings: false,
  showChat: false,
  unreadMessages: 0,
};

const [useProvideWidgetContext, useWidgetContextRaw] = createInjectionState(
  (initialValue?: WidgetState): WidgetContext => {
    const state = shallowRef<WidgetState>(initialValue ?? defaultState);

    function dispatch(action: WidgetContextAction): void {
      state.value = widgetReducer(state.value, action);
    }

    return {
      state,
      dispatch,
    };
  },
);

export function useWidgetContext(): WidgetContext {
  const context = useWidgetContextRaw();
  if (!context) {
    throw new Error(
      'Widget context not found. Make sure you have a WidgetContextProvider in your component tree.',
    );
  }
  return context;
}

export function useMaybeWidgetContext(): WidgetContext | undefined {
  return useWidgetContextRaw();
}

export function useEnsureWidgetContext(widgetContext?: WidgetContext): WidgetContext {
  if (widgetContext) {
    return widgetContext;
  }

  return useWidgetContext();
}

export { useProvideWidgetContext };
