import { useCreateLayoutContext } from '@/context';
import { injectLocal } from '@vueuse/core';

export function setup() {
  const layoutContext = useCreateLayoutContext();

  injectLocal('useCreateLayoutContext', useCreateLayoutContext());
}
