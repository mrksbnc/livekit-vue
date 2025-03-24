<template>
  <button :class="buttonClasses" @click="handleOnClick">
    <span v-if="showIcon">
      <TrackIcon
        :enabled="enabled"
        :source="source"
        :class="`h-5 w-5 ${enabled ? 'text-white' : 'text-red-600'}`"
      />
    </span>
  </button>
</template>

<script setup lang="ts">
import TrackIcon from '@/components/icons/TrackIcon.vue';
import { useTrackToggle } from '@/composables';
import '@/index.css';
import { TailwindCss } from '@/utils/tailwindcss';
import { computed } from 'vue';
import type { TrackToggleProps } from './track_toggle';

const props = defineProps<TrackToggleProps>();

const trackToggleProps = useTrackToggle(props);
const enabled = computed(() => trackToggleProps.enabled.value);

const staticClasses =
  /*tw*/ 'cursor-pointer p-2.5 bg-gray-900 bg-opacity-5 hover:bg-gray-800 text-white rounded-md';

const buttonClasses = computed<string>(() => {
  return TailwindCss.instance.merge(staticClasses);
});

function handleOnClick(): void {
  trackToggleProps.toggle?.();
}
</script>
