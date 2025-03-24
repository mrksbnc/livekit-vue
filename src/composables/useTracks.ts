import { useEnsureRoomContext } from '@/context/room.context';
import {
  isSourcesWithOptions,
  isSourceWitOptions,
  trackReferencesObservable,
  type SourcesArray,
  type TrackReference,
  type TrackReferenceOrPlaceholder,
  type TrackReferencePlaceholder,
} from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import { Participant, Track, type Room, type RoomEvent } from 'livekit-client';
import { computed, shallowRef, type Ref } from 'vue';

export type UseTracksOptions = {
  updateOnlyOn?: RoomEvent[];
  onlySubscribed?: boolean;
  room?: Room;
};

export type UseTracks = {
  trackReferences: Ref<TrackReferenceOrPlaceholder[] | TrackReference[]>;
};

function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}

export function requiredPlaceholders(
  sources: SourcesArray,
  participants: Participant[],
): Map<Participant['identity'], Track.Source[]> {
  const placeholderMap = new Map<Participant['identity'], Track.Source[]>();
  if (isSourcesWithOptions(sources)) {
    const sourcesThatNeedPlaceholder = sources
      .filter((sourceWithOption) => sourceWithOption.withPlaceholder)
      .map((sourceWithOption) => sourceWithOption.source);

    participants.forEach((participant) => {
      const sourcesOfSubscribedTracks = participant
        .getTrackPublications()
        .map((pub) => pub.track?.source)
        .filter((trackSource): trackSource is Track.Source => trackSource !== undefined);
      const placeholderNeededForThisParticipant = Array.from(
        difference(new Set(sourcesThatNeedPlaceholder), new Set(sourcesOfSubscribedTracks)),
      );
      // If the participant needs placeholder add it to the placeholder map.
      if (placeholderNeededForThisParticipant.length > 0) {
        placeholderMap.set(participant.identity, placeholderNeededForThisParticipant);
      }
    });
  }
  return placeholderMap;
}

export function useTracks(
  sources: SourcesArray = [
    Track.Source.Camera,
    Track.Source.Microphone,
    Track.Source.ScreenShare,
    Track.Source.ScreenShareAudio,
    Track.Source.Unknown,
  ],
  options: UseTracksOptions = {},
): UseTracks {
  const room = useEnsureRoomContext(options.room);
  const participants = shallowRef<Participant[]>([]);
  const trackReferences = shallowRef<TrackReference[]>([]);

  const computedSources = computed<Track.Source[]>(() => {
    return sources.map((s) => (isSourceWitOptions(s) ? s.source : s));
  });

  const computedTrackRefs = computed<TrackReferenceOrPlaceholder[] | TrackReference[]>(() => {
    if (isSourcesWithOptions(sources)) {
      const requirePlaceholder = requiredPlaceholders(sources, participants.value as Participant[]);

      const trackReferencesWithPlaceholders = Array.from(
        trackReferences.value,
      ) as TrackReferenceOrPlaceholder[];

      for (const participant of participants.value) {
        if (requirePlaceholder.has(participant.identity)) {
          const sourcesToAddPlaceholder = requirePlaceholder.get(participant.identity) ?? [];

          for (const placeholderSource of sourcesToAddPlaceholder) {
            if (
              trackReferencesWithPlaceholders.find(
                ({ participant: p, publication }) =>
                  participant.identity === p.identity && publication?.source === placeholderSource,
              )
            ) {
              continue;
            }

            console.debug(
              `Add ${placeholderSource} placeholder for participant ${participant.identity}.`,
            );

            const placeholder: TrackReferencePlaceholder = {
              participant: participant as Participant,
              source: placeholderSource as Track.Source,
            };

            trackReferencesWithPlaceholders.push(placeholder);
          }
        }
      }

      return trackReferencesWithPlaceholders;
    } else {
      return trackReferences.value;
    }
  });

  useSubscription(
    trackReferencesObservable(room.value, computedSources.value, {}).subscribe((data) => {
      console.debug('setting track bundles', trackReferences, participants);
      trackReferences.value = data.trackReferences;
      participants.value = data.participants;
    }),
  );

  return {
    trackReferences: computedTrackRefs,
  };
}
