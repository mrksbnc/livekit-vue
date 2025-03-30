<template>
  <div
    class="lk-connection-quality"
    :data-lk-quality="quality"
    :title="`Connection quality: ${qualityText}`"
  >
    <div class="lk-connection-quality-bar"></div>
    <div class="lk-connection-quality-bar"></div>
    <div class="lk-connection-quality-bar"></div>
  </div>
</template>

<script setup lang="ts">
import { useConnectionQualityIndicator } from '@/composables';
import { useMaybeParticipantContext } from '@/context';
import { ConnectionQuality } from 'livekit-client';
import { computed } from 'vue';
import type { ConnectionQualityIndicatorProps } from './connection_quality_indicator';

const props = defineProps<ConnectionQualityIndicatorProps>();

const participantContext = useMaybeParticipantContext();
const participant = computed(() => props.participant ?? participantContext?.value);

const { quality } = useConnectionQualityIndicator({ participant: participant.value });

const qualityText = computed(() => {
  switch (quality.value) {
    case ConnectionQuality.Excellent:
      return 'Excellent';
    case ConnectionQuality.Good:
      return 'Good';
    case ConnectionQuality.Poor:
      return 'Poor';
    default:
      return 'Unknown';
  }
});
</script>
