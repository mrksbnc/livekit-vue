<template>
  <div
    class="lk-connection-state flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
    :class="stateClass"
  >
    <span class="lk-connection-state-dot h-2 w-2 animate-pulse rounded-full"></span>
    <span>{{ displayText }}</span>
  </div>
</template>

<script setup lang="ts">
import { useConnectionState } from '@/composables';
import { computed } from 'vue';

const { connectionState } = useConnectionState();

const stateClass = computed(() => {
  const state = connectionState.value;
  const stateStr = String(state);

  if (stateStr === 'connecting') {
    return 'bg-yellow-500/20 text-yellow-500';
  } else if (stateStr === 'connected') {
    return 'bg-green-500/20 text-green-500';
  } else if (stateStr === 'disconnected') {
    return 'bg-gray-500/20 text-gray-500';
  } else if (stateStr === 'failed') {
    return 'bg-red-500/20 text-red-500';
  } else {
    return 'bg-gray-500/20 text-gray-500';
  }
});

const displayText = computed(() => {
  const state = connectionState.value;
  const stateStr = String(state);

  if (stateStr === 'connecting') {
    return 'Connecting...';
  } else if (stateStr === 'connected') {
    return 'Connected';
  } else if (stateStr === 'disconnected') {
    return 'Disconnected';
  } else if (stateStr === 'failed') {
    return 'Connection Failed';
  } else {
    return 'Unknown';
  }
});
</script>

<style scoped></style>
