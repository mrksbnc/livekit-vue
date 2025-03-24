import { useEnsureRoomContext } from '@/context/room.context';
import { observeParticipantMedia, type ParticipantMedia } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import { LocalParticipant, TrackPublication, type Room } from 'livekit-client';
import { ref, shallowRef, watch, type Ref, type ShallowRef } from 'vue';

export type UseLocalParticipantOptions = {
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

export function useLocalParticipant(options: UseLocalParticipantOptions = {}): UseLocalParticipant {
  const room = useEnsureRoomContext(options.room);

  const localParticipant = shallowRef<LocalParticipant | undefined>(room.value?.localParticipant);
  const isMicrophoneEnabled = ref(localParticipant.value?.isMicrophoneEnabled ?? false);
  const isCameraEnabled = ref(localParticipant.value?.isCameraEnabled ?? false);
  const isScreenShareEnabled = ref(localParticipant.value?.isScreenShareEnabled ?? false);

  const lastMicrophoneError = ref<Error | undefined>(localParticipant.value?.lastMicrophoneError);
  const lastCameraError = ref<Error | undefined>(localParticipant.value?.lastCameraError);

  const microphoneTrack = shallowRef<TrackPublication | undefined>(undefined);

  const cameraTrack = shallowRef<TrackPublication | undefined>(undefined);

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
    microphoneTrack,
    cameraTrack,
    lastMicrophoneError,
    lastCameraError,
    localParticipant,
  };
}
