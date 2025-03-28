import { useEnsureRoomContext } from '@/context/room.context';
import { observeParticipantMedia, type ParticipantMedia } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import { LocalParticipant, TrackPublication, type Room } from 'livekit-client';
import { ref, watch, type ShallowRef } from 'vue';

export type UseLocalParticipantOptions = {
  room?: Room;
};

export type UseLocalParticipantReturnType = {
  isMicrophoneEnabled: ShallowRef<boolean>;
  isScreenShareEnabled: ShallowRef<boolean>;
  isCameraEnabled: ShallowRef<boolean>;
  microphoneTrack: ShallowRef<TrackPublication | undefined>;
  cameraTrack: ShallowRef<TrackPublication | undefined>;
  lastMicrophoneError: ShallowRef<Error | undefined>;
  lastCameraError: ShallowRef<Error | undefined>;
  localParticipant: ShallowRef<LocalParticipant | undefined>;
};

export function useLocalParticipant(
  options: UseLocalParticipantOptions = {},
): UseLocalParticipantReturnType {
  const room = useEnsureRoomContext(options.room);

  const localParticipant = ref<LocalParticipant | undefined>(room.value?.localParticipant);
  const isMicrophoneEnabled = ref(localParticipant.value?.isMicrophoneEnabled ?? false);
  const isCameraEnabled = ref(localParticipant.value?.isCameraEnabled ?? false);
  const isScreenShareEnabled = ref(localParticipant.value?.isScreenShareEnabled ?? false);

  const lastMicrophoneError = ref<Error | undefined>(localParticipant.value?.lastMicrophoneError);
  const lastCameraError = ref<Error | undefined>(localParticipant.value?.lastCameraError);

  const microphoneTrack = ref<TrackPublication | undefined>(undefined);

  const cameraTrack = ref<TrackPublication | undefined>(undefined);

  function handleUpdate(media: ParticipantMedia<LocalParticipant>) {
    isCameraEnabled.value = media.isCameraEnabled;
    isMicrophoneEnabled.value = media.isMicrophoneEnabled;
    isScreenShareEnabled.value = media.isScreenShareEnabled;
    cameraTrack.value = media.cameraTrack;
    microphoneTrack.value = media.microphoneTrack;
    lastMicrophoneError.value = media.participant.lastMicrophoneError;
    lastCameraError.value = media.participant.lastCameraError;
    localParticipant.value = media.participant;
  }

  watch(room, () =>
    useSubscription(observeParticipantMedia(room.value.localParticipant).subscribe(handleUpdate)),
  );

  return {
    isMicrophoneEnabled,
    isScreenShareEnabled,
    isCameraEnabled,
    microphoneTrack: microphoneTrack as ShallowRef<TrackPublication | undefined>,
    cameraTrack: cameraTrack as ShallowRef<TrackPublication | undefined>,
    lastMicrophoneError,
    lastCameraError,
    localParticipant: localParticipant as ShallowRef<LocalParticipant | undefined>,
  };
}
