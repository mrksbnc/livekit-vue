import type { WidgetState } from '@livekit/components-core';
import { createInjectionState } from '@vueuse/core';
import { shallowRef } from 'vue';
import { type LayoutContextAction } from './layout.context';

export function widgetReducer(state: WidgetState, action: LayoutContextAction): WidgetState {
  if (action.msg === 'toggle_settings') {
    return { ...state, showSettings: !state.showSettings };
  }
  return { ...state };
}

const [useProvideWidgetContext, useWidgetContext] = createInjectionState(
  (initialValue: WidgetState) => {
    const state = shallowRef<WidgetState>(
      initialValue ?? {
        showSettings: false,
        showChat: false,
        unreadMessages: 0,
      },
    );

    function dispatch(action: LayoutContextAction) {
      state.value = widgetReducer(state.value, action);
    }

    return {
      state,
      dispatch,
    };
  },
);

export { useProvideWidgetContext, useWidgetContext };
