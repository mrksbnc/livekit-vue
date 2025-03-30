import { useEnsureRoomContext } from '@/context/room.context';
import { observeParticipantMedia, type ParticipantMedia } from '@livekit/components-core';
import { LocalParticipant, TrackPublication, type Room } from 'livekit-client';
import { ref, shallowRef, watchEffect, type Ref, type ShallowRef } from 'vue';

export type UseLocalParticipantProps = {
  room?: Room;
};

export type UseLocalParticipant = {
  isMicrophoneEnabled: Ref<boolean>;
  isScreenShareEnabled: Ref<boolean>;
  isCameraEnabled: Ref<boolean>;
  microphoneTrack: ShallowRef<TrackPublication | undefined>;
  cameraTrack: ShallowRef<TrackPublication | undefined>;
  lastMicrophoneError: Ref<Error | undefined>;
  lastCameraError: Ref<Error | undefined>;
  localParticipant: ShallowRef<LocalParticipant | undefined>;
};

export function useLocalParticipant(props: UseLocalParticipantProps = {}): UseLocalParticipant {
  const room = useEnsureRoomContext(props.room);

  const localParticipant = shallowRef<LocalParticipant | undefined>(room.value?.localParticipant);
  const isMicrophoneEnabled = ref<boolean>(localParticipant.value?.isMicrophoneEnabled ?? false);
  const isCameraEnabled = ref<boolean>(localParticipant.value?.isCameraEnabled ?? false);
  const isScreenShareEnabled = ref<boolean>(localParticipant.value?.isScreenShareEnabled ?? false);
  const lastMicrophoneError = ref<Error | undefined>(localParticipant.value?.lastMicrophoneError);
  const lastCameraError = ref<Error | undefined>(localParticipant.value?.lastCameraError);
  const microphoneTrack = shallowRef<TrackPublication | undefined>(undefined);
  const cameraTrack = shallowRef<TrackPublication | undefined>(undefined);

  const handleUpdate = (media: ParticipantMedia<LocalParticipant>): void => {
    isCameraEnabled.value = media.isCameraEnabled;
    isMicrophoneEnabled.value = media.isMicrophoneEnabled;
    isScreenShareEnabled.value = media.isScreenShareEnabled;
    cameraTrack.value = media.cameraTrack;
    microphoneTrack.value = media.microphoneTrack;
    lastMicrophoneError.value = media.participant.lastMicrophoneError;
    lastCameraError.value = media.participant.lastCameraError;
    localParticipant.value = media.participant;
  };

  watchEffect((onCleanup) => {
    if (!room.value?.localParticipant) {
      return;
    }

    const mediaObservable = observeParticipantMedia(room.value.localParticipant);
    const subscription = mediaObservable.subscribe({
      next: handleUpdate,
      error: (err) => {
        console.error('Error in participant media observable:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return {
    isMicrophoneEnabled,
    isScreenShareEnabled,
    isCameraEnabled,
    microphoneTrack,
    cameraTrack,
    lastMicrophoneError,
    lastCameraError,
    localParticipant,
  };
}
