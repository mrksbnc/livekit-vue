<script setup lang="ts">
import type { ParticipantClickEvent, TrackReference } from '@livekit/components-core';
import { useDebounce, useIntersectionObserver } from '@vueuse/core';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useEnsureTrackRef } from '../composables/useEnsureTrackRef';
import { useMediaTrackBySourceOrName } from '../composables/useMediaTrackBySourceOrName';

interface Props {
  trackRef?: TrackReference;
  onTrackClick?: (evt: ParticipantClickEvent) => void;
  onSubscriptionStatusChanged?: (subscribed: boolean) => void;
  manageSubscription?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  manageSubscription: true,
});

const emit = defineEmits<{
  (e: 'trackClick', evt: ParticipantClickEvent): void;
  (e: 'subscriptionStatusChanged', subscribed: boolean): void;
}>();

const trackReference = useEnsureTrackRef(props.trackRef);
const mediaEl = ref<HTMLVideoElement | null>(null);

// Set up intersection observer for subscription management
const { stop: stopObserver, observe } = useIntersectionObserver(mediaEl, ([entry]) => {
  if (!entry) return;

  if (props.manageSubscription && trackReference.value?.publication && entry.isIntersecting) {
    trackReference.value.publication.setSubscribed(true);
  }
});

// Debounce the intersection observer to prevent rapid subscription changes
const debouncedEntry = useDebounce(mediaEl, 3000);

watch(debouncedEntry, ([entry]) => {
  if (!entry) return;

  if (props.manageSubscription && trackReference.value?.publication && !entry.isIntersecting) {
    trackReference.value.publication.setSubscribed(false);
  }
});

const { elementProps, publication, isSubscribed } = useMediaTrackBySourceOrName(trackReference, {
  element: mediaEl,
});

// Watch subscription status changes
watch(isSubscribed, (subscribed) => {
  emit('subscriptionStatusChanged', !!subscribed);
});

const clickHandler = () => {
  if (publication.value) {
    emit('trackClick', {
      participant: trackReference.value?.participant,
      track: publication.value,
    });
  }
};

onMounted(() => {
  observe();
});

onUnmounted(() => {
  stopObserver();
});
</script>

<template>
  <video ref="mediaEl" v-bind="elementProps" :muted="true" @click="clickHandler" />
</template>
