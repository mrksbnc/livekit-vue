<template>//</template>

<script setup lang="ts" generic="T extends ToggleSource">
import type { ToggleSource } from '@livekit/components-core';
import type { TrackToggleProps } from './track_toggle';
import { useTrackToggle } from '@/composables';
import { toRefs } from 'vue';

const props = defineProps<TrackToggleProps<T>>();

const trackToggle = useTrackToggle<T>(props);

const {} = toRefs(trackToggle);
</script>
