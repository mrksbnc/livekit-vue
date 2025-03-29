<template>
  <slot />
</template>

<script setup lang="ts">
import { useTrackRefContextProvider } from '@/context';
import type { TrackReference, TrackReferenceOrPlaceholder } from '@livekit/components-core';

const props = defineProps<{
  trackRef: TrackReferenceOrPlaceholder | TrackReference;
}>();

useTrackRefContextProvider(props.trackRef);
</script>
