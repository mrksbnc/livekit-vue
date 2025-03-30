<template>
  <div class="lk-speaker-layout flex h-full w-full flex-col gap-4 p-4">
    <!-- Active speaker container -->
    <div class="lk-active-speaker relative flex-1 overflow-hidden rounded-lg bg-gray-800">
      <slot name="activeSpeaker">
        <!-- Fallback if no active speaker -->
        <div class="absolute inset-0 flex items-center justify-center text-gray-500">
          <div class="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mx-auto mb-2 h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <p>Waiting for someone to speak...</p>
          </div>
        </div>
      </slot>
    </div>

    <!-- Other participants grid -->
    <div
      class="lk-others-container grid gap-2 transition-all duration-300 ease-in-out"
      :class="gridClass"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  otherParticipantsCount: {
    type: Number,
    default: 0,
  },
  maxThumbnails: {
    type: Number,
    default: 6,
  },
});

/**
 * Dynamically calculate the grid size and layout based on participant count
 */
const gridClass = computed(() => {
  const count = Math.min(props.otherParticipantsCount, props.maxThumbnails);

  if (count === 0) return 'h-0';
  if (count === 1) return 'h-24 grid-cols-1';
  if (count === 2) return 'h-24 grid-cols-2';
  if (count <= 4) return 'h-24 grid-cols-2 sm:grid-cols-4';
  if (count <= 6) return 'h-24 grid-cols-3 sm:grid-cols-6';
  return 'h-24 grid-cols-3 sm:grid-cols-6';
});
</script>

<style scoped>
/* Responsive adjustments */
@media (max-width: 768px) {
  .lk-speaker-layout {
    gap: 2px;
    padding: 0.5rem;
  }

  .lk-others-container {
    height: 20px;
  }
}

@media (max-width: 640px) {
  .lk-active-speaker {
    height: 60vh;
  }

  .lk-others-container {
    gap: 1px;
  }
}
</style>
