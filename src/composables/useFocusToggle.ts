import { useMaybeLayoutContext } from '@/context/layout.context';
import { useEnsureTrackRef } from '@/context/track_reference.context';
import { isTrackReferencePinned, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { computed, type HTMLAttributes } from 'vue';

export type UseFocusToggleProps = {
  trackRef?: TrackReferenceOrPlaceholder;
  props: HTMLAttributes;
};

export function useFocusToggle({ trackRef, props }: UseFocusToggleProps) {
  const trackReference = useEnsureTrackRef(trackRef);
  const layoutContext = useMaybeLayoutContext();

  const className = 'lk-focus-toggle-button';

  const inFocus = computed<boolean>(() => {
    return isTrackReferencePinned(trackReference.value, layoutContext?.value?.pin.state);
  });

  const elementProps = computed<HTMLAttributes>(() => {
    return {
      ...props,
      class: className,
      'data-lk-toggle-focused': inFocus.value,
    };
  });

  return {
    elementProps,
    inFocus,
  };
}
