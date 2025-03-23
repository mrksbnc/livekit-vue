<template>
  <button v-bind="trackToggle.buttonProps" class="track-toggle">
    <span v-if="showIcon">
      <TrackIcon :enabled="enabled" :source="source" />
    </span>
  </button>
</template>

<script setup lang="ts">
import TrackIcon from '@/components/icons/TrackIcon.vue';
import { useTrackToggle } from '@/composables';
import { computed } from 'vue';
import type { TrackToggleProps } from './track_toggle';

const props = defineProps<TrackToggleProps>();

const trackToggle = useTrackToggle(props);

const enabled = computed<boolean>(() => trackToggle.enabled.value);
</script>
