import type { TrackReference, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { createInjectionState } from '@vueuse/core';
import { shallowRef, type ShallowRef } from 'vue';
import { MissingContextError } from './error';

export type TrackRefContext = ShallowRef<TrackReferenceOrPlaceholder>;

const [useProvideTrackRefContext, useTrackRefContextRaw] = createInjectionState(
  (ref: TrackReference | TrackReferenceOrPlaceholder): TrackRefContext => {
    return shallowRef(ref);
  },
);

export { useProvideTrackRefContext, useTrackRefContextRaw };

export function useMaybeTrackRefContext(): TrackRefContext | undefined {
  return useTrackRefContextRaw();
}

export function useTrackRefContext(): TrackRefContext {
  const context = useMaybeTrackRefContext();

  if (!context) {
    throw new MissingContextError(
      'Please call `useProvideTrackRefContext` on the appropriate parent component',
    );
  }

  return context;
}

export function useEnsureTrackRef(trackRef?: TrackReferenceOrPlaceholder): TrackRefContext {
  if (trackRef) {
    return shallowRef(trackRef);
  }

  return useTrackRefContext();
}
