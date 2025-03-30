<template>
  <GridLayout :trackCount="participants.length" class="h-full w-full">
    <ParticipantTile
      v-for="participant in participants"
      :key="participant.identity"
      :participant="participant"
      :source="Track.Source.Camera"
      class="h-full w-full overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800 shadow-md transition-all duration-300 hover:shadow-lg"
    >
      <template #placeholder>
        <div class="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-400">
          <ParticipantPlaceholderIcon />
        </div>
      </template>

      <template #overlay>
        <div
          class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-2"
        >
          <ParticipantName
            :participant="participant"
            class="truncate text-sm font-medium text-white"
          />
        </div>

        <div class="absolute top-2 right-2 flex items-center gap-1">
          <TrackMutedIndicator
            :source="Track.Source.Microphone"
            :participant="participant"
            class="rounded-full bg-black/40 p-1 text-white"
          />
          <TrackMutedIndicator
            :source="Track.Source.Camera"
            :participant="participant"
            class="rounded-full bg-black/40 p-1 text-white"
          />
          <ConnectionQualityIndicator
            :participant="participant"
            class="rounded-full bg-black/40 p-1 text-white"
          />
        </div>
      </template>
    </ParticipantTile>
  </GridLayout>
</template>

<script setup lang="ts">
import { useParticipants } from '@/composables';
import { Track } from 'livekit-client';
import ParticipantPlaceholderIcon from './icons/ParticipantPlaceholderIcon.vue';
import { GridLayout } from './layouts';
import ConnectionQualityIndicator from './participant/ConnectionQualityIndicator.vue';
import ParticipantName from './participant/ParticipantName.vue';
import ParticipantTile from './participant/ParticipantTile.vue';
import TrackMutedIndicator from './participant/TrackMutedIndicator.vue';

const { participants } = useParticipants();
</script>

<style scoped>
.participant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  grid-auto-rows: minmax(240px, auto);
  gap: 1rem;
  width: 100%;
  height: 100%;
  padding: 1rem;
  overflow: auto;
}

.participant-tile {
  aspect-ratio: 16/9;
  min-height: 240px;
  overflow: hidden;
}

@media (max-width: 640px) {
  .participant-grid {
    grid-template-columns: 1fr;
  }
}
</style>
