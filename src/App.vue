<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-200">
    <div class="flex items-center justify-center gap-1 bg-gray-200 p-2">
      <TrackToggle :source="Track.Source.Camera" :show-icon="true" :initial-state="false" />
      <TrackToggle :source="Track.Source.Microphone" :show-icon="true" :initial-state="false" />
      <DisconnectButton />
    </div>
    <div></div>
  </div>
</template>

<script setup lang="ts">
import { Room, Track } from 'livekit-client';
import DisconnectButton from './components/controls/DisconnectButton.vue';
import TrackToggle from './components/controls/TrackToggle.vue';
import { useProvideRoomContext } from './context';
import './index.css';

useProvideRoomContext(
  new Room({
    adaptiveStream: true,
  }),
);
</script>

<style></style>
