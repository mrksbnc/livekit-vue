import {
  getTrackByIdentifier,
  isTrackReference,
  setupMediaTrack,
  type TrackIdentifier,
} from '@livekit/components-core';
import { Track, type TrackPublication } from 'livekit-client';
import {
  computed,
  ref,
  shallowRef,
  watchEffect,
  type AudioHTMLAttributes,
  type Ref,
  type ShallowRef,
  type VideoHTMLAttributes,
} from 'vue';

export type UseMediaTrackOptions = {
  element?: Ref<HTMLMediaElement | undefined>;
  props?: VideoHTMLAttributes | AudioHTMLAttributes;
};

export enum TrackOrientation {
  Landscape = 'landscape',
  Portrait = 'portrait',
  Unknown = 'unknown',
}

export type MediaTrackAttributes = {
  'data-lk-local-participant': boolean;
  'data-lk-source': Track.Source;
  'data-lk-orientation': TrackOrientation;
};

export type UseMediaTrackBySourceOrName = {
  publication: ShallowRef<TrackPublication | undefined>;
  isMuted: Ref<boolean>;
  isSubscribed: Ref<boolean>;
  track: ShallowRef<Track | undefined>;
  attributes: Ref<MediaTrackAttributes>;
};

export type UseMediaTrackBySourceOrNameProps = {
  observerOptions: TrackIdentifier;
  options: UseMediaTrackOptions;
};

export function useMediaTrackBySourceOrName(
  props: UseMediaTrackBySourceOrNameProps,
): UseMediaTrackBySourceOrName {
  const publication = shallowRef<TrackPublication | undefined>(
    getTrackByIdentifier(props.observerOptions),
  );

  const previousElement = ref<HTMLMediaElement>();

  const isMuted = ref<boolean>(publication.value?.isMuted ?? false);
  const isSubscribed = ref<boolean>(publication.value?.isSubscribed ?? false);
  const track = shallowRef<Track | undefined>(publication.value?.track);
  const orientation = ref<TrackOrientation>(TrackOrientation.Landscape);

  const deps = computed<(string | false | undefined)[]>(() => [
    props.observerOptions.participant.sid ?? props.observerOptions.participant.identity,
    props.observerOptions.source,
    isTrackReference(props.observerOptions) && props.observerOptions.publication.trackSid,
  ]);

  const mediaTrack = computed<ReturnType<typeof setupMediaTrack>>(() =>
    setupMediaTrack(props.observerOptions),
  );

  const attributes = computed<MediaTrackAttributes>(() => ({
    'data-lk-local-participant': props.observerOptions.participant.isLocal,
    'data-lk-source': publication.value?.source ?? Track.Source.Unknown,
    'data-lk-orientation':
      publication.value?.kind === 'video' ? orientation.value : TrackOrientation.Unknown,
  }));

  watchEffect((onCleanup) => {
    // Force evaluation of dependencies to ensure reactivity
    const _ = deps.value;

    const trackObserver = mediaTrack.value.trackObserver;
    if (!trackObserver) {
      return;
    }

    const subscription = trackObserver.subscribe((pub) => {
      publication.value = pub;
      isMuted.value = pub?.isMuted ?? false;
      isSubscribed.value = pub?.isSubscribed ?? false;
      track.value = pub?.track;
    });

    onCleanup(() => subscription.unsubscribe());
  });

  watchEffect((onCleanup) => {
    const currentTrack = track.value;
    const element = props.options.element ?? null;

    if (currentTrack) {
      if (previousElement.value) {
        try {
          currentTrack.detach(previousElement.value);
        } catch (error) {
          console.error('Error detaching track from previous element:', error);
        }
      }

      if (
        element &&
        element.value &&
        !(props.observerOptions.participant.isLocal && currentTrack.kind === 'audio')
      ) {
        currentTrack.attach(element.value);
      }
    }

    previousElement.value = element?.value;

    onCleanup(() => {
      if (previousElement.value && currentTrack) {
        try {
          currentTrack.detach(previousElement.value);
        } catch (error) {
          console.error('Error detaching track during cleanup:', error);
        }
      }
    });
  });

  watchEffect(() => {
    const pub = publication.value;
    if (pub?.dimensions?.width && pub?.dimensions?.height) {
      orientation.value =
        pub.dimensions.width > pub.dimensions.height
          ? TrackOrientation.Landscape
          : TrackOrientation.Portrait;
    }
  });

  return {
    publication,
    isMuted,
    isSubscribed,
    track,
    attributes,
  };
}
