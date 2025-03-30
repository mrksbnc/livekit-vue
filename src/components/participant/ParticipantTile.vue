<template>
  <div
    class="after:border-accent-bg group relative flex flex-col gap-1.5 overflow-hidden rounded-md after:pointer-events-none after:absolute after:inset-0 after:rounded-md after:border-0 after:border-solid after:transition-[border,opacity] after:delay-500 after:duration-400 hover:after:delay-0"
    v-bind="attributes"
    @click="onClick"
    :class="{
      'after:border-[2.5px] after:delay-0 after:duration-200':
        attributes['data-lk-speaking'] && attributes['data-lk-source'] !== Track.Source.ScreenShare,
    }"
  >
    <div
      class="bg-bg2 pointer-events-none absolute inset-0 flex items-center justify-center rounded-md opacity-0 transition-opacity duration-200 ease-in-out"
      :class="{
        'opacity-100':
          attributes['data-lk-video-muted'] && attributes['data-lk-source'] === Track.Source.Camera,
      }"
    >
      <div class="flex items-center justify-center">
        <slot name="placeholder"></slot>
      </div>
    </div>
    <slot name="video">
      <VideoTrack
        v-if="trackReference?.source === Track.Source.Camera || source === Track.Source.Camera"
        v-bind="videoTrackProps"
        @track-click="handleTrackClick"
      />
      <VideoTrack
        v-else-if="
          trackReference?.source === Track.Source.ScreenShare || source === Track.Source.ScreenShare
        "
        v-bind="videoTrackProps"
        @track-click="handleTrackClick"
      />
    </slot>
    <div
      class="absolute right-1 bottom-1 left-1 flex flex-row items-center justify-between gap-2 leading-none"
    >
      <div class="flex items-center rounded-sm bg-black/50 p-1">
        <slot name="connection-quality">
          <ConnectionQualityIndicator
            v-if="showConnectionQuality"
            :participant="trackReference?.participant || participant"
            class="h-6 w-6 opacity-0 transition-opacity delay-200 duration-200 ease-in-out group-hover:opacity-100 group-hover:delay-0"
            :class="{ 'opacity-100 delay-0': quality === 'poor' }"
          />
        </slot>
      </div>
      <div class="flex items-center rounded-sm bg-black/50 p-1">
        <slot name="participant-name">
          <ParticipantName
            :participant="trackReference?.participant || participant"
            class="text-sm"
          >
            <template #default="{ identity }">
              <span v-if="displayName">{{ displayName }}</span>
              <span v-else>{{ identity }}</span>
            </template>
          </ParticipantName>
        </slot>
      </div>
    </div>
    <div class="absolute top-0 left-0 flex flex-col gap-1 p-1">
      <div class="flex items-center" v-if="!hideDefaultVideoMutedIndicator">
        <slot name="video-muted" :isMuted="isVideoMuted">
          <TrackMutedIndicator
            v-if="isVideoMuted"
            :trackRef="videoTrackReference"
            :source="Track.Source.Camera"
            :participant="trackReference?.participant || participant"
            class="rounded-sm bg-black/50 p-1"
          />
        </slot>
      </div>
      <div class="flex items-center" v-if="!hideDefaultAudioMutedIndicator">
        <slot name="audio-muted" :isMuted="isAudioMuted">
          <TrackMutedIndicator
            v-if="isAudioMuted"
            :source="Track.Source.Microphone"
            :participant="trackReference?.participant || participant"
            class="rounded-sm bg-black/50 p-1"
          />
        </slot>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import {
  useConnectionQualityIndicator,
  useIsMuted,
  useParticipantTile,
  useTrack,
} from '@/composables';
import type { ParticipantClickEvent, TrackReference } from '@livekit/components-core';
import { Track } from 'livekit-client';
import { computed } from 'vue';
import ConnectionQualityIndicator from './ConnectionQualityIndicator.vue';
import type { ParticipantTileProps } from './participant_tile';
import ParticipantName from './ParticipantName.vue';
import TrackMutedIndicator from './TrackMutedIndicator.vue';
import VideoTrack from './VideoTrack.vue';

const props = withDefaults(defineProps<ParticipantTileProps>(), {
  autoManageSubscription: true,
  showConnectionQuality: true,
  showParticipantScreenShare: true,
  hideDefaultAudioMutedIndicator: false,
  hideDefaultVideoMutedIndicator: false,
});

const emit = defineEmits<{
  (e: 'click', event: ParticipantClickEvent): void;
}>();

// Get the track reference if participant and source are provided
const { trackReference: computedTrackReference } = useTrack({
  participant: props.participant,
  source: props.source ?? Track.Source.Unknown,
});

// Use provided trackRef or computed one
const trackReference = computed(() => props.trackRef ?? computedTrackReference.value);

// Component props for VideoTrack - properly cast as TrackReference when needed
const videoTrackProps = computed(() => ({
  trackRef: trackReference.value?.source ? (trackReference.value as TrackReference) : undefined,
  manageSubscription: props.autoManageSubscription,
}));

// Get the video track reference for muted indicator
const videoTrackReference = computed(() => {
  if (trackReference.value?.source === Track.Source.Camera) {
    return trackReference.value;
  }
  return {
    participant: trackReference.value?.participant || props.participant,
    source: Track.Source.Camera,
  };
});

// Get the audio track reference for muted indicator
const audioTrackReference = computed(() => {
  return {
    participant: trackReference.value?.participant || props.participant,
    source: Track.Source.Microphone,
  };
});

// Check if video is muted
const { isMuted: isVideoMuted } = useIsMuted({
  sourceOrTrackRef: videoTrackReference.value,
  participant: props.participant,
});

// Check if audio is muted
const { isMuted: isAudioMuted } = useIsMuted({
  sourceOrTrackRef: audioTrackReference.value,
  participant: props.participant,
});

// Get connection quality if available
const participant = computed(() => trackReference.value?.participant || props.participant);
const { quality } = useConnectionQualityIndicator({ participant: participant.value });

const { attributes, onClick: tileOnClick } = useParticipantTile({
  trackRef: trackReference.value,
  disableSpeakingIndicator: props.disableSpeakingIndicator,
  onParticipantClick: props.onParticipantClick,
});

const handleTrackClick = (event: ParticipantClickEvent) => {
  emit('click', event);
};

const onClick = () => {
  tileOnClick();
  if (trackReference.value?.participant) {
    emit('click', {
      participant: trackReference.value.participant,
      track: trackReference.value.publication,
    });
  }
};
</script>
