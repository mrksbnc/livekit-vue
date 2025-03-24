import { useMaybeLayoutContext } from '@/context/layout.context';
import { useEnsureTrackRef } from '@/context/track_reference.context';
import { isTrackReferencePinned, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { computed, type Ref } from 'vue';

export type FocusToggleAttributes = {
  'data-lk-toggle-focused'?: boolean;
};

export type UseFocusToggleProps = {
  trackRef?: TrackReferenceOrPlaceholder;
  /**
   * Attributes to bind on the root element.
   */
  attributes?: FocusToggleAttributes;
};

export type UseFocusToggle = {
  inFocus: Ref<boolean>;
  attributes: Ref<FocusToggleAttributes>;
};

export function useFocusToggle({ trackRef }: UseFocusToggleProps): UseFocusToggle {
  const trackReference = useEnsureTrackRef(trackRef);
  const layoutContext = useMaybeLayoutContext();

  const inFocus = computed<boolean>(() => {
    return isTrackReferencePinned(trackReference.value, layoutContext?.value?.pin.state);
  });

  const attributes = computed<FocusToggleAttributes>(() => {
    const attr: FocusToggleAttributes = {
      'data-lk-toggle-focused': inFocus.value,
    };
    return attr;
  });

  return {
    attributes,
    inFocus,
  };
}
