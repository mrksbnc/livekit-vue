<template>
  <div class="lk-grid-layout grid h-full w-full auto-rows-fr gap-4 p-4" :class="gridClass">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  columns: {
    type: Number,
    default: 0,
  },
  gap: {
    type: String,
    default: '4',
  },
  trackCount: {
    type: Number,
    default: 0,
  },
});

/**
 * Dynamically calculate the grid columns based on number of participants
 */
const gridClass = computed(() => {
  if (props.columns > 0) {
    return `grid-cols-${props.columns}`;
  }

  // Responsive grid that adapts to the number of participants
  const count = props.trackCount || 0;

  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (count <= 4) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2';
  if (count <= 6) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
  if (count <= 8) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  if (count <= 12) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
});
</script>

<style scoped>
/* Mobile responsiveness */
@media (max-width: 640px) {
  .lk-grid-layout {
    gap: 0.5rem;
    padding: 0.5rem;
  }
}
</style>
