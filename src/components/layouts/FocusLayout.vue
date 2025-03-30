<template>
  <div class="lk-focus-layout flex h-full w-full flex-col gap-4 p-4 md:flex-row">
    <!-- Main focused area -->
    <div class="lk-focus-container flex-1 overflow-hidden rounded-lg bg-gray-800">
      <slot name="focused"></slot>
    </div>
    <!-- Side panel with other participants -->
    <div
      class="lk-sidebar flex w-full flex-col gap-2 overflow-y-auto md:w-1/4 md:max-w-xs"
      :class="{ 'h-1/4 md:h-full': showSidebar, 'h-0 md:h-0': !showSidebar }"
    >
      <slot name="sidebar"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  showSidebar: {
    type: Boolean,
    default: true,
  },
});
</script>
