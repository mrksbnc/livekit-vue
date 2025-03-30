<template>
  <audio ref="audioRef"></audio>
</template>

<script setup lang="ts">
import { useMediaTrackBySourceOrName } from '@/composables';
import { useEnsureTrackRef } from '@/context';
import { RemoteAudioTrack, RemoteTrackPublication } from 'livekit-client';
import { ref, watch, watchEffect } from 'vue';
import type { AudioTrackProps } from './audio_track';

const props = defineProps<AudioTrackProps>();

const emit = defineEmits<{
  (e: 'subscription-status-changed', subscribed: boolean): void;
}>();

const trackReference = useEnsureTrackRef(props.trackRef);
const audioRef = ref<HTMLAudioElement>();

const { publication, isSubscribed, track } = useMediaTrackBySourceOrName({
  observerOptions: trackReference.value,
  options: {
    element: audioRef,
  },
});

// Watch subscription status and emit events
watch(isSubscribed, (newValue) => {
  emit('subscription-status-changed', !!newValue);
});

// Handle volume changes
watchEffect(() => {
  if (!track.value || props.volume === undefined) {
    return;
  }

  if (track.value instanceof RemoteAudioTrack) {
    track.value.setVolume(props.volume);
  } else {
    console.warn('Volume can only be set on remote audio tracks.');
  }
});

// Handle muted status
watchEffect(() => {
  if (!publication.value || props.muted === undefined) {
    return;
  }

  if (publication.value instanceof RemoteTrackPublication) {
    publication.value.setEnabled(!props.muted);
  } else {
    console.warn('Can only call setEnabled on remote track publications.');
  }
});
</script>
