<template>
  <slot />
</template>

<script setup lang="ts">
import { useProvideTrackRefContext } from '@/context';
import type { TrackReference, TrackReferenceOrPlaceholder } from '@livekit/components-core';

const props = defineProps<{
  trackRef: TrackReferenceOrPlaceholder | TrackReference;
}>();

useProvideTrackRefContext(props.trackRef);
</script>
