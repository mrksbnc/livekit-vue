<template>
  <div
    class="after:border-accent-bg group relative flex flex-col gap-1.5 overflow-hidden rounded-md after:pointer-events-none after:absolute after:inset-0 after:rounded-md after:border-0 after:border-solid after:transition-[border,opacity] after:delay-500 after:duration-400 hover:after:delay-0"
    v-bind="attributes"
    @click="onClick"
    :class="{
      'after:border-[2.5px] after:delay-0 after:duration-200':
        attributes && attributes['data-lk-speaking'],
    }"
  >
    <slot name="audio">
      <AudioTrack :trackRef="trackRefForAudio" />
    </slot>

    <div
      class="absolute right-1 bottom-1 left-1 flex flex-row items-center justify-between gap-2 leading-none"
    >
      <div class="flex items-center rounded-sm bg-black/50 p-1">
        <slot name="participant-name">
          <ParticipantName :participant="getParticipant()" class="text-sm">
            <template #default="{ identity }">
              <span v-if="displayName">{{ displayName }}</span>
              <span v-else>{{ identity }}</span>
            </template>
          </ParticipantName>
        </slot>
      </div>
    </div>

    <div v-if="showAudioVisualizer" class="flex h-full w-full items-center justify-center">
      <slot name="audio-visualizer">
        <AudioVisualizer
          :trackRef="trackRefForVisualizer"
          class="bg-bg-control aspect-video h-full min-h-[160px] w-full rounded-md"
        />
      </slot>
    </div>

    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { useParticipantTile, useTrack } from '@/composables';
import type { TrackReference } from '@livekit/components-core';
import { Track } from 'livekit-client';
import { computed } from 'vue';
import AudioTrack from './AudioTrack.vue';
import AudioVisualizer from './AudioVisualizer.vue';
import type { ParticipantAudioTileProps } from './participant_audio_tile';
import ParticipantName from './ParticipantName.vue';

const props = withDefaults(defineProps<ParticipantAudioTileProps>(), {
  showAudioVisualizer: false,
  disableSpeakingIndicator: false,
});

// Get the track reference if participant is provided
const { trackReference: computedTrackReference } = useTrack({
  participant: props.participant,
  source: Track.Source.Microphone,
});

// Use provided trackRef or computed one
const trackReference = computed(() => props.trackRef ?? computedTrackReference.value);

// Create safe references for components that expect TrackReference
const trackRefForAudio = computed(() =>
  trackReference.value?.source ? (trackReference.value as TrackReference) : undefined,
);

const trackRefForVisualizer = computed(() =>
  trackReference.value?.source ? (trackReference.value as TrackReference) : undefined,
);

const { attributes, onClick } = useParticipantTile({
  trackRef: trackReference.value,
  disableSpeakingIndicator: props.disableSpeakingIndicator,
});

// Helper function for participant
function getParticipant() {
  return trackReference.value?.participant ?? props.participant;
}
</script>
