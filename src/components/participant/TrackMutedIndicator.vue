<template>
  <div class="lk-muted-indicator" :data-lk-source="trackSource">
    <slot v-if="isMuted" :source="trackSource">
      <div v-if="trackSource === Track.Source.Microphone">Mic off</div>
      <div v-else-if="trackSource === Track.Source.Camera">Camera off</div>
      <div v-else-if="trackSource === Track.Source.ScreenShare">Screen share off</div>
      <div v-else-if="trackSource === Track.Source.ScreenShareAudio">Screen share audio off</div>
      <div v-else>Track muted</div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useIsMuted, useTrack } from '@/composables';
import { Track } from 'livekit-client';
import { computed } from 'vue';
import type { TrackMutedIndicatorProps } from './track_muted_indicator';

const props = defineProps<TrackMutedIndicatorProps>();

// If we have a trackRef, use that, otherwise get a track from the participant
const { trackReference } = useTrack({
  participant: props.participant,
  source: props.source ?? Track.Source.Unknown,
});

const sourceOrTrackRef = computed(() => {
  // Make sure we handle undefined properly
  return props.trackRef ? props.trackRef : trackReference.value || { source: Track.Source.Unknown };
});

const { isMuted } = useIsMuted({
  sourceOrTrackRef: sourceOrTrackRef.value,
  participant: props.participant,
});

const trackSource = computed(() => {
  if (props.trackRef) {
    return props.trackRef.source ?? Track.Source.Unknown;
  } else if (props.source) {
    return props.source;
  } else {
    return Track.Source.Unknown;
  }
});
</script>
