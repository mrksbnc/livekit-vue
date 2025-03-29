import { useMaybeLayoutContext } from '@/context/layout.context';
import { useEnsureTrackRef } from '@/context/track_reference.context';
import { isTrackReferencePinned, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { computed, type ComputedRef } from 'vue';

export type FocusToggleAttributes = {
  'data-lk-toggle-focused'?: boolean;
};

export type FocusToggleOptions = {
  trackRef?: TrackReferenceOrPlaceholder;
};

export type UseFocusToggle = {
  inFocus: ComputedRef<boolean>;
  attributes: ComputedRef<FocusToggleAttributes>;
  onClick: () => void;
};

export function useFocusToggle(options: FocusToggleOptions): UseFocusToggle {
  const trackReference = useEnsureTrackRef(options.trackRef);
  const layoutContext = useMaybeLayoutContext();

  const inFocus = computed<boolean>(() =>
    isTrackReferencePinned(trackReference.value, layoutContext?.value?.pin.state),
  );

  const attributes = computed<FocusToggleAttributes>(() => ({
    'data-lk-toggle-focused': inFocus.value,
  }));

  function onClick(): void {
    if (inFocus.value) {
      layoutContext?.value?.pin.dispatch?.({
        msg: 'clear_pin',
      });
    } else {
      layoutContext?.value?.pin.dispatch?.({
        msg: 'set_pin',
        trackReference: trackReference.value,
      });
    }
  }

  return {
    inFocus,
    attributes,
    onClick,
  };
}
