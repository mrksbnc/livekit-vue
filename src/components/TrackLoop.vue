<template>
  <div class="track-loop">
    <div v-for="track in tracks" :key="getTrackReferenceId(track)">
      <TrackRefContextProvider :track-ref="track">
        <template #default>
          <slot name="loop-item" :track="track" />
        </template>
      </TrackRefContextProvider>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getTrackReferenceId,
  type TrackReference,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-core';
import TrackRefContextProvider from './provider/TrackRefContextProvider.vue';

defineProps<{
  tracks: TrackReference[] | TrackReferenceOrPlaceholder[];
}>();
</script>
