import { useEnsureParticipant } from '@/context';
import { participantPermissionObserver } from '@livekit/components-core';
import type { ParticipantPermission } from '@livekit/protocol';
import type { Participant } from 'livekit-client';
import { shallowRef, watchEffect, type ShallowRef } from 'vue';

export type UseParticipantPermissionsProps = {
  participant?: Participant;
};

export type UseParticipantPermissions = {
  permissions: ShallowRef<ParticipantPermission | undefined>;
};

export function useParticipantPermissions(
  props: UseParticipantPermissionsProps = {},
): UseParticipantPermissions {
  const participant = useEnsureParticipant(props.participant);
  const permissions = shallowRef<ParticipantPermission | undefined>(participant.value?.permissions);

  watchEffect((onCleanup) => {
    if (!participant.value) {
      return;
    }

    const observer = participantPermissionObserver(participant.value);
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
