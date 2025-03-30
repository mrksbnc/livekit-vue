import { onUnmounted, ref, watchEffect, type Ref } from 'vue';

export type UseSwipeOptions = {
  minSwipeDistance?: number;
  onLeftSwipe?: () => void;
  onRightSwipe?: () => void;
};

export type UseSwipeProps = {
  element: Ref<HTMLElement | null>;
  options: UseSwipeOptions;
};

export type UseSwipe = {
  onTouchStart: (event: TouchEvent) => void;
  onTouchMove: (event: TouchEvent) => void;
  onTouchEnd: () => void;
};

export function useSwipe(props: UseSwipeProps): UseSwipe {
  const touchEnd = ref<number | null>(null);
  const touchStart = ref<number | null>(null);
  const currentElement = ref<HTMLElement | null>(null);
  const minSwipeDistance = props.options.minSwipeDistance ?? 50;

  const onTouchStart = (event: TouchEvent): void => {
    touchEnd.value = null;
    touchStart.value = event.targetTouches[0].clientX;
  };

  const onTouchMove = (event: TouchEvent): void => {
    touchEnd.value = event.targetTouches[0].clientX;
  };

  const onTouchEnd = (): void => {
    if (!touchStart.value || !touchEnd.value) {
      return;
    }

    const distance = touchStart.value - touchEnd.value;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && props.options.onLeftSwipe) props.options.onLeftSwipe();
    if (isRightSwipe && props.options.onRightSwipe) props.options.onRightSwipe();
  };

  const cleanupEventListeners = (): void => {
    if (!currentElement.value) return;

    currentElement.value.removeEventListener('touchstart', onTouchStart);
    currentElement.value.removeEventListener('touchmove', onTouchMove);
    currentElement.value.removeEventListener('touchend', onTouchEnd);
  };

  watchEffect(() => {
    cleanupEventListeners();

    currentElement.value = props.element.value;
    if (currentElement.value) {
      currentElement.value.addEventListener('touchstart', onTouchStart, { passive: true });
      currentElement.value.addEventListener('touchmove', onTouchMove, { passive: true });
      currentElement.value.addEventListener('touchend', onTouchEnd, { passive: true });
    }
  });

  onUnmounted(cleanupEventListeners);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
