<template>
  <audio ref="audioElement" class="audio" />
</template>

<script setup lang="ts">
import { useEnsureTrackRef } from '@/context/track_reference.context';
import { ref, toRefs } from 'vue';
import { type AudioTrackProps } from './audio_track';

const props = defineProps<AudioTrackProps>();

const { trackRef, volume, muted, onSubscriptionStatusChanged } = toRefs(props);

const trackReference = useEnsureTrackRef(trackRef.value);

const audioElement = ref<HTMLAudioElement>();
</script>
