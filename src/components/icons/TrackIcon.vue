<template>
  <VideoSvg v-if="source === TrackIcon.Camera" :class="trackIconClasses" />
  <VideoOffSvg v-else-if="source === TrackIcon.CameraDisabled" :class="trackIconClasses" />
  <MicSvg v-else-if="source === TrackIcon.Microphone" :class="trackIconClasses" />
  <MicOffSvg v-else-if="source === TrackIcon.MicrophoneDisabled" :class="trackIconClasses" />
  <ScreenShareSvg v-else-if="source === TrackIcon.ScreenShare" :class="trackIconClasses" />
  <ScreenShareDisabledSvg
    v-else-if="source === TrackIcon.ScreenShareDisabled"
    :class="trackIconClasses"
  />
  <span v-else class="track-icon__none" />
</template>

<script setup lang="ts">
import MicOffSvg from '@/assets/icons/mic-off.svg?component';
import MicSvg from '@/assets/icons/mic.svg?component';
import ScreenShareDisabledSvg from '@/assets/icons/share-screen-off.svg?component';
import ScreenShareSvg from '@/assets/icons/share-screen.svg?component';
import VideoOffSvg from '@/assets/icons/video-off.svg?component';
import VideoSvg from '@/assets/icons/video.svg?component';
import { Track } from 'livekit-client';
import { computed } from 'vue';

const props = defineProps<{
  source: Track.Source;
  enabled: boolean;
}>();

enum TrackIcon {
  None = 'none',
  Camera = 'camera',
  CameraDisabled = 'camera-disabled',
  Microphone = 'microphone',
  MicrophoneDisabled = 'microphone-disabled',
  ScreenShare = 'screen-share',
  ScreenShareDisabled = 'screen-share-disabled',
}

const source = computed<TrackIcon>(() => {
  switch (props.source) {
    case Track.Source.Camera:
      return props.enabled ? TrackIcon.Camera : TrackIcon.CameraDisabled;
    case Track.Source.Microphone:
      return props.enabled ? TrackIcon.Microphone : TrackIcon.MicrophoneDisabled;
    case Track.Source.ScreenShare:
      return props.enabled ? TrackIcon.ScreenShare : TrackIcon.ScreenShareDisabled;
    default:
      return TrackIcon.None;
  }
});

const trackIconClasses = computed<string>(() => {
  return /*tw*/ 'track-icon w-4 h-4  flex items-center justify-center';
});
</script>
