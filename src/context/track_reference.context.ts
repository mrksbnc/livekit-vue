import type { TrackReference, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { createInjectionState } from '@vueuse/core';
import { shallowRef, type ShallowRef } from 'vue';

export type TrackReferenceContext = {
  trackRef: ShallowRef<TrackReference | TrackReferenceOrPlaceholder>;
};

export type UseTrackReferenceArgs = {
  reference: TrackReference | TrackReferenceOrPlaceholder;
};

const [useTrackRefContextProvider, useTrackRefContext] = createInjectionState(
  ({ reference }: UseTrackReferenceArgs): TrackReferenceContext => {
    const trackRef = shallowRef(reference);

    return {
      trackRef,
    };
  },
);

export function useMaybeTrackRefContext(): TrackReferenceContext | undefined {
  return useTrackRefContext();
}

export function useEnsureTrackRef(
  trackRef?: TrackReferenceOrPlaceholder,
): Readonly<ShallowRef<TrackReferenceOrPlaceholder>> {
  const context = useTrackRefContext();

  let t = context?.trackRef;

  if (trackRef) {
    t = shallowRef(trackRef);
  }

  if (!t || !t.value) {
    throw new Error('Please call `useTrackRefContextProvider` on the appropriate parent component');
  }

  return t;
}

export { useTrackRefContext, useTrackRefContextProvider };
