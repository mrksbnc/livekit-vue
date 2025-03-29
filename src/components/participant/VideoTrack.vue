<template>
  <video ref="mediaEl" :muted="true" @click="onTrackClickHandler"></video>
</template>

<script setup lang="ts">
import { useMediaTrackBySourceOrName } from '@/composables/useMediaTrackBySourceOrName';
import { useEnsureTrackRef } from '@/context';
import { ref, toRefs, watch } from 'vue';
import type { VideoTrackProps } from './video_track';

const props = defineProps<VideoTrackProps>();

const { trackRef, onSubscriptionStatusChanged, attrs, manageSubscription, onClick, onTrackClick } =
  toRefs(props);

const mediaEl = ref<HTMLVideoElement>();
const trackReference = useEnsureTrackRef(props.trackRef);

const {
  elementProps,
  publication: pub,
  isSubscribed,
} = useMediaTrackBySourceOrName(trackReference.value, {
  element: mediaEl.value,
  props: props.attrs,
});

watch(isSubscribed, (isSubscribed) => {
  onSubscriptionStatusChanged.value?.(!!isSubscribed);
});

watch([trackReference, manageSubscription], () => {
  if (
    manageSubscription.value &&
    trackReference.value.publication instanceof RemoteTrackPublication &&
    debouncedIntersectionEntry?.isIntersecting === false &&
    intersectionEntry?.isIntersecting === false
  ) {
    trackReference.publication.setSubscribed(false);
  }
});

function onTrackClickHandler(evt: MouseEvent) {
  onClick?.value?.(evt);
  onTrackClick?.value?.({
    participant: trackReference.value.participant,
    track: pub.value,
  });
}
</script>
