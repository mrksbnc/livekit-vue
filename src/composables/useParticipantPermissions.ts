import { useEnsureParticipant } from '@/context';
import { participantPermissionObserver } from '@livekit/components-core';
import type { ParticipantPermission } from '@livekit/protocol';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant } from 'livekit-client';
import { computed, ref, type ShallowRef } from 'vue';

export type UseParticipantPermissionsOptions = {
  participant?: Participant;
};

export function useParticipantPermissions(
  options: UseParticipantPermissionsOptions = {},
): ShallowRef<ParticipantPermission | undefined> {
  const p = useEnsureParticipant(options.participant);

  const permission = ref<ParticipantPermission | undefined>(undefined);

  const permissionObserver = computed(() => participantPermissionObserver(p.value));

  useSubscription(
    permissionObserver.value.subscribe((permissions) => {
      permission.value = permissions;
    }),
  );

  return permission as ShallowRef<ParticipantPermission | undefined>;
}
