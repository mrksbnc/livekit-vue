<template>
  <div class="lk-participant-name">
    <slot v-if="info" :name="info.name" :identity="info.identity" :metadata="info.metadata">
      {{ participantName }}
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useParticipantInfo } from '@/composables';
import { useMaybeParticipantContext } from '@/context';
import { computed } from 'vue';
import type { ParticipantNameProps } from './participant_name';

const props = defineProps<ParticipantNameProps>();

const participantContext = useMaybeParticipantContext();
const participant = computed(() => props.participant ?? participantContext?.value);

const { info } = useParticipantInfo({ participant: participant.value });

const participantName = computed(() => {
  if (!info.value) return '';
  return info.value.name || info.value.identity;
});
</script>
