<template>
  <div class="h-screen w-screen bg-gray-100">
    <div class="flex h-full w-full flex-col items-center justify-center">
      <div class="text-center">LiveKit Vue</div>
      <TrackIcon :source="Track.Source.Camera" :enabled="false" />

      <ParticipantPlaceholderIcon class="h-16 w-16 rounded-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Track } from 'livekit-client';
import ParticipantPlaceholderIcon from './components/icons/ParticipantPlaceholderIcon.vue';
import TrackIcon from './components/icons/TrackIcon.vue';
</script>
