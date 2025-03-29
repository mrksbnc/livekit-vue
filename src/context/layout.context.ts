import { createInjectionState } from '@vueuse/core';
import { computed, shallowRef, type ShallowRef } from 'vue';
import type { PinContext } from './pin.context';
import { usePinContext } from './pin.context';
import type { WidgetContext } from './widget.context';
import { useWidgetContext } from './widget.context';

export type LayoutContext = {
  pin: PinContext;
  widget: WidgetContext;
};

const [useProvideLayoutContext, useLayoutContextRaw] = createInjectionState(
  (initialState?: LayoutContext): ShallowRef<LayoutContext> => {
    return shallowRef<LayoutContext>(initialState ?? createLayoutContext());
  },
);

export function useLayoutContext(): ShallowRef<LayoutContext> {
  const context = useLayoutContextRaw();
  if (!context) {
    throw new Error(
      'Layout context not found. Make sure you have a LayoutContextProvider in your component tree.',
    );
  }
  return context;
}

export { useLayoutContextRaw, useProvideLayoutContext };

export function useMaybeLayoutContext(): ShallowRef<LayoutContext> | undefined {
  return useLayoutContextRaw();
}

export function useEnsureLayoutContext(layoutContext?: LayoutContext): ShallowRef<LayoutContext> {
  if (layoutContext) {
    return shallowRef(layoutContext);
  }

  return useLayoutContext();
}

export function createLayoutContext(): LayoutContext {
  return {
    pin: usePinContext(),
    widget: useWidgetContext(),
  };
}

export function useCreateLayoutContext(): LayoutContext {
  return createLayoutContext();
}

export function useEnsureCreateLayoutContext(
  layoutContext?: LayoutContext,
): ShallowRef<LayoutContext> {
  if (layoutContext) {
    return shallowRef(layoutContext);
  }

  return computed(() => createLayoutContext());
}
