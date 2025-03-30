<template>
  <button
    :class="staticClasses"
    @click="handleOnClick"
  >
    <span v-if="showIcon">
      <TrackIcon
        :enabled="enabled"
        :source="source"
        :class="`h-5 w-5 ${iconColorClass}`"
      />
    </span>
    <span
      v-if="label"
      class="ml-2.5"
      >{{ label }}</span
    >
  </button>
</template>

<script setup lang="ts">
import TrackIcon from '@/components/icons/TrackIcon.vue';
import { useTrackToggle } from '@/composables';
import '@/index.css';
import { computed } from 'vue';
import type { TrackToggleProps } from './track_toggle';
nst trackToggleProps = useTrackToggle(props);
const enabled = computed(() => trackToggleProps.enabled.value);

const staticClasses =
  /*tw*/ 'cursor-pointer p-2.5 bg-gray-800 bg-black/20 rounded-lg text-sm text-white transition-colors duration-200 hover:bg-gray-800 hover:text-white';

const iconColorClass = computed<string>(() => {
  return enabled.value ? 'text-white' : 'text-red-600';
});

function handleOnClick(): void {
  trackToggleProps.toggle?.();
}
</script>
