import { useEnsureRoomContext } from '@/context/room.context';
import {
  isSourcesWithOptions,
  isSourceWitOptions,
  trackReferencesObservable,
  type SourcesArray,
  type TrackReference,
  type TrackReferenceOrPlaceholder,
  type TrackReferencePlaceholder,
  type TrackSourceWithOptions,
} from '@livekit/components-core';
import { Participant, Track, type Room, type RoomEvent } from 'livekit-client';
import { computed, shallowRef, watchEffect, type ComputedRef, type ShallowRef } from 'vue';

export type UseTracksOptions = {
  updateOnlyOn?: RoomEvent[];
  onlySubscribed?: boolean;
  room?: Room;
};

export type UseTracks<T extends SourcesArray = Track.Source[]> = {
  trackReferences: T extends Track.Source[]
    ? ShallowRef<TrackReference[]>
    : T extends TrackSourceWithOptions[]
      ? ComputedRef<TrackReferenceOrPlaceholder[]>
      : never;
};

function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const difference = new Set(setA);

  for (const elem of setB) {
    difference.delete(elem);
  }
  return difference;
}

export type RequiredPlaceholdersProps = {
  sources: SourcesArray;
  participants: Participant[];
};

export function requiredPlaceholders(
  props: RequiredPlaceholdersProps,
): Map<Participant['identity'], Track.Source[]> {
  const placeholderMap = new Map<Participant['identity'], Track.Source[]>();
  if (isSourcesWithOptions(props.sources)) {
    const sourcesThatNeedPlaceholder = props.sources
      .filter((sourceWithOption) => sourceWithOption.withPlaceholder)
      .map((sourceWithOption) => sourceWithOption.source);

    for (const participant of props.participants) {
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
    }
  }
  return placeholderMap;
}

export function useTracks<T extends SourcesArray = Track.Source[]>(
  sources: T = [
    Track.Source.Camera,
    Track.Source.Microphone,
    Track.Source.ScreenShare,
    Track.Source.ScreenShareAudio,
    Track.Source.Unknown,
  ] as T,
  options: UseTracksOptions = {},
): UseTracks<T> {
  const room = useEnsureRoomContext(options.room);
  const participants = shallowRef<Participant[]>([]);
  const trackReferences = shallowRef<TrackReference[]>([]);

  const computedSources = computed<Track.Source[]>(() => {
    return sources.map((s) => (isSourceWitOptions(s) ? s.source : s));
  });

  const computedTrackRefs = computed<TrackReferenceOrPlaceholder[] | TrackReference[]>(() => {
    if (isSourcesWithOptions(sources)) {
      const requirePlaceholder = requiredPlaceholders({
        sources,
        participants: participants.value as Participant[],
      });
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

  watchEffect((onCleanup) => {
    if (!room.value) {
      return;
    }

    const subscription = trackReferencesObservable(room.value, computedSources.value, {
      additionalRoomEvents: options.updateOnlyOn,
      onlySubscribed: options.onlySubscribed,
    }).subscribe({
      next: (data) => {
        console.debug('Updating track references:', data);
        trackReferences.value = data.trackReferences;
        participants.value = data.participants;
      },
      error: (err) => {
        console.error('Error in track references subscription:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return {
    trackReferences: (isSourcesWithOptions(sources)
      ? computedTrackRefs
      : trackReferences) as UseTracks<T>['trackReferences'],
  };
}
