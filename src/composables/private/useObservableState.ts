import { useSubscription } from '@vueuse/rxjs';
import { Observable } from 'rxjs';
import { computed, shallowRef, watch, type ShallowRef } from 'vue';

export type UseObservableStateArgs<T = unknown> = {
  observable?: Observable<T> | undefined;
  startWith: T;
  resetWhenObservableChanges?: boolean;
};

export function useObservableState<T>(options: UseObservableStateArgs<T>): ShallowRef<T> {
  const state = shallowRef<T>(options.startWith);

  const observable = computed<Observable<T | undefined> | undefined>(() => {
    return options.observable;
  });

  const resetWhenObservableChanges = computed<boolean>(() => {
    return options.resetWhenObservableChanges ?? false;
  });

  watch([observable, resetWhenObservableChanges], () => {
    if (resetWhenObservableChanges.value) {
      state.value = options.startWith;
    }

    if (typeof window === 'undefined' || !options.observable) {
      return;
    }

    if (observable.value) {
      useSubscription(
        observable.value.subscribe((value) => {
          state.value = value ?? options.startWith;
        }),
      );
    }
  });

  return state;
}
