import { useEnsureParticipant } from '@/context';
import { participantPermissionObserver } from '@livekit/components-core';
import type { ParticipantPermission } from '@livekit/protocol';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant } from 'livekit-client';
import { computed, shallowRef, type ShallowRef } from 'vue';

export type UseParticipantPermissionsOptions = {
  participant?: Participant;
};

export type UseParticipantPermissions = {
  permission: ShallowRef<ParticipantPermission | undefined>;
};

export function useParticipantPermissions(
  options: UseParticipantPermissionsOptions = {},
): UseParticipantPermissions {
  const p = useEnsureParticipant(options.participant);

  const permission = shallowRef<ParticipantPermission | undefined>(undefined);

  const permissionObserver = computed(() => participantPermissionObserver(p.value));

  useSubscription(
    permissionObserver.value.subscribe((permissions) => {
      permission.value = permissions;
    }),
  );

  return {
    permission: permission,
  };
}
