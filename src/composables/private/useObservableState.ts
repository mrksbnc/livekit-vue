import { useSubscription } from '@vueuse/rxjs';
import type { Observable } from 'rxjs';
import { ref, watch, type Ref } from 'vue';

export type UseObservableStateArgs<T> = {
  observable?: Observable<T>;
  startWith: T;
  resetWhenObservableChanges?: boolean;
};

export function useObservableState<T>(options: UseObservableStateArgs<T>): Readonly<Ref<T>> {
  const state = ref<T>(options.startWith);

  watch([options.observable, options.resetWhenObservableChanges], () => {
    if (options.resetWhenObservableChanges) {
      state.value = options.startWith;
    }

    if (typeof window === 'undefined' || !options.observable) {
      return;
    }

    useSubscription(options.observable.subscribe((val) => (state.value = val)));
  });

  return state;
}
