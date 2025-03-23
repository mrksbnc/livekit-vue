import {
  getTrackByIdentifier,
  setupMediaTrack,
  type TrackIdentifier,
} from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Track, TrackPublication } from 'livekit-client';
import { computed, ref, watch, type Ref } from 'vue';

export type UseMediaTrackOptions = {
  element?: Ref<HTMLMediaElement> | null;
  props?: HTMLVideoElement | HTMLAudioElement;
};

export function useMediaTrackBySourceOrName(
  observerOptions: TrackIdentifier,
  options: UseMediaTrackOptions = {},
) {
  const previousElement = ref<HTMLMediaElement>();
  const publication = ref<TrackPublication | undefined>(getTrackByIdentifier(observerOptions));

  const orientation = ref<'landscape' | 'portrait'>('landscape');
  const isMuted = ref<boolean>(publication.value?.isMuted ?? false);
  const isSubscribed = ref<boolean>(publication.value?.isSubscribed ?? false);
  const track = ref<Track | undefined>((publication.value?.track as Track) ?? undefined);

  const mediaTrackSetupResult = computed(() => {
    return setupMediaTrack(observerOptions);
  });

  const trackObservable = computed(() => {
    return mediaTrackSetupResult.value.trackObserver;
  });

  const classes = computed(() => {
    return mediaTrackSetupResult.value.className;
  });

  useSubscription(
    trackObservable.value.subscribe((pub) => {
      console.debug('Track update received', pub);

      publication.value = pub;
      isMuted.value = publication.value?.isMuted ?? false;
      isSubscribed.value = publication.value?.isSubscribed ?? false;
      track.value = publication.value?.track as Track;
    }),
  );

  function onTrackOrOptionsElementChanged() {
    if (track.value) {
      if (previousElement.value) {
        track.value.detach(previousElement.value);
      }
      if (
        options.element?.value &&
        !(observerOptions.participant.isLocal && track.value?.kind === 'audio')
      ) {
        track.value.attach(options.element.value);
      }
    }

    previousElement.value = options.element?.value;
  }

  watch(previousElement, (val, prev) => {
    if (prev) {
      track.value?.detach(prev);
    }
  });

  watch(publication, () => {
    if (
      typeof publication.value?.dimensions?.width === 'number' &&
      typeof publication.value?.dimensions?.height === 'number'
    ) {
      const newOrientation =
        publication.value.dimensions.width > publication.value.dimensions.height
          ? 'landscape'
          : 'portrait';

      if (orientation.value !== newOrientation) {
        orientation.value = newOrientation;
      }
    }
  });

  return {
    publication,
    isMuted,
    isSubscribed,
    track,
    componentProps: {
      ...options.props,
      classes,
      'data-lk-local-participant': observerOptions.participant.isLocal,
      'data-lk-source': publication.value?.source,
      ...(publication.value?.kind === 'video' && { 'data-lk-orientation': orientation }),
    },
  };
}
