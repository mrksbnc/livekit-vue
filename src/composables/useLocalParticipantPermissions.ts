import { useEnsureRoomContext } from '@/context/room.context';
import { participantPermissionObserver } from '@livekit/components-core';
import type { ParticipantPermission } from '@livekit/protocol';
import type { Room } from 'livekit-client';
import { shallowRef, watchEffect, type ShallowRef } from 'vue';

export type UseLocalParticipantPermissionsOptions = {
  room?: Room;
};

export type UseLocalParticipantPermissions = {
  permissions: ShallowRef<ParticipantPermission | undefined>;
};

export type UseLocalParticipantPermissionsProps = {
  options: UseLocalParticipantPermissionsOptions;
};

export function useLocalParticipantPermissions(
  props: UseLocalParticipantPermissionsProps,
): UseLocalParticipantPermissions {
  const room = useEnsureRoomContext(props.options.room);

  const permissions = shallowRef<ParticipantPermission | undefined>(
    room.value?.localParticipant?.permissions,
  );

  watchEffect((onCleanup) => {
    if (!room.value?.localParticipant) {
      return;
    }

    const observer = participantPermissionObserver(room.value.localParticipant);
    if (!observer) {
      return;
    }

    const subscription = observer.subscribe({
      next: (newPermissions) => {
        permissions.value = newPermissions;
      },
      error: (err) => {
        console.error('Error in participant permission observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return { permissions };
}
