import type { TrackReference, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { createInjectionState } from '@vueuse/core';
import { shallowRef, type ShallowRef } from 'vue';

const [useTrackRefContextProvider, useTrackRefContext] = createInjectionState(
  (
    ref: TrackReference | TrackReferenceOrPlaceholder,
  ): Readonly<ShallowRef<TrackReferenceOrPlaceholder>> => {
    const trackRef = shallowRef(ref);

    return trackRef;
  },
);

export function useMaybeTrackRefContext():
  | Readonly<ShallowRef<TrackReferenceOrPlaceholder>>
  | undefined {
  return useTrackRefContext();
}

export function useEnsureTrackRef(
  trackRef?: TrackReferenceOrPlaceholder,
): Readonly<ShallowRef<TrackReferenceOrPlaceholder>> {
  const t = trackRef ? shallowRef(trackRef) : useTrackRefContext();

  if (!t || !t.value) {
    throw new Error('Please call `useTrackRefContextProvider` on the appropriate parent component');
  }

  return t;
}

export { useTrackRefContext, useTrackRefContextProvider };
