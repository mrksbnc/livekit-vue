<template>
  <video ref="videoRef" v-bind="{ ...attrs }" muted @click="handleClick"></video>
</template>

<script setup lang="ts">
import { useMediaTrackBySourceOrName } from '@/composables';
import { useEnsureTrackRef } from '@/context';
import type { ParticipantClickEvent } from '@livekit/components-core';
import { useDebounceFn, useIntersectionObserver } from '@vueuse/core';
import { RemoteTrackPublication } from 'livekit-client';
import { onUnmounted, ref, watch, watchEffect } from 'vue';
import { VideoTrackEvent, type VideoTrackProps } from './video_track';

const props = defineProps<VideoTrackProps>();

const emit = defineEmits<{
  (e: VideoTrackEvent.TrackClick, event: ParticipantClickEvent): void;
  (e: VideoTrackEvent.SubscriptionStatusChanged, subscribed: boolean): void;
}>();

const trackReference = useEnsureTrackRef(props.trackRef);

const isVisible = ref(false);
const videoRef = ref<HTMLVideoElement>();

const isHiddenLongEnough = ref(false);

const { stop: stopObserver } = useIntersectionObserver(
  videoRef,
  (entries) => {
    isVisible.value = entries[0]?.isIntersecting ?? false;
  },
  { threshold: 0.1 },
);

const { publication, isSubscribed } = useMediaTrackBySourceOrName({
  observerOptions: trackReference.value,
  options: {
    element: videoRef,
    props: props.attrs,
  },
});

const debouncedHide = useDebounceFn(() => {
  if (!isVisible.value) {
    isHiddenLongEnough.value = true;
  }
}, 3000);

const handleClick = () => {
  if (publication.value) {
    emit(VideoTrackEvent.TrackClick, {
      participant: trackReference.value?.participant,
      track: publication.value,
    });
  }
};

watch(isVisible, (nv) => {
  if (nv) {
    isHiddenLongEnough.value = false;
  } else {
    debouncedHide();
  }
});

watchEffect(() => {
  if (!props.manageSubscription || !trackReference.value?.publication) {
    return;
  }

  if (trackReference.value.publication instanceof RemoteTrackPublication) {
    if (isVisible.value) {
      trackReference.value.publication.setSubscribed(true);
    } else if (isHiddenLongEnough.value) {
      trackReference.value.publication.setSubscribed(false);
    }
  }
});

watch(isSubscribed, (newValue) => {
  emit(VideoTrackEvent.SubscriptionStatusChanged, !!newValue);
});

onUnmounted(() => {
  stopObserver();
});
</script>
