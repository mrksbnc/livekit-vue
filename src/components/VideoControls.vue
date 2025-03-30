<template>
  <div class="flex items-center justify-center gap-2 bg-gray-900/80 p-3 backdrop-blur">
    <TrackToggle
      :source="Track.Source.Microphone"
      :show-icon="true"
      class="lk-button"
    />
    <TrackToggle
      :source="Track.Source.Camera"
      :show-icon="true"
      class="lk-button"
    />
    <TrackToggle
      :source="Track.Source.ScreenShare"
      :show-icon="true"
      class="lk-button"
    />
    <DisconnectButton class="lk-button" />
  </div>
</template>

<script setup lang="ts">
import { Track } from 'livekit-client';
import DisconnectButton from './controls/DisconnectButton.vue';
import TrackToggle from './controls/TrackToggle.vue';
</script>
