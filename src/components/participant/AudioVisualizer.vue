<template>
  <svg
    width="100%"
    height="100%"
    :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
    class="lk-audio-visualizer"
  >
    <rect x="0" y="0" width="100%" height="100%" />
    <g
      :style="{
        transform: `translate(${(svgWidth - barCount * (barWidth + barSpacing)) / 2}px, 0)`,
      }"
    >
      <rect
        v-for="(vol, idx) in volumes"
        :key="idx"
        :x="idx * (barWidth + barSpacing)"
        :y="svgHeight / 2 - (vol * volMultiplier) / 2"
        :width="barWidth"
        :height="vol * volMultiplier"
      ></rect>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { useEnsureTrackRef } from '@/context';
import { ref } from 'vue';
import type { AudioVisualizerProps } from './audio_visualizer';

const props = defineProps<AudioVisualizerProps>();

const svgWidth = 200;
const svgHeight = 90;
const barWidth = 6;
const barSpacing = 4;
const volMultiplier = 50;
const barCount = 7;

const trackReference = useEnsureTrackRef(props.trackRef);

// Generate random volume bars for visualization
const volumes = ref<number[]>(Array(barCount).fill(0));
let animationId: number | null = null;

// Simple animation for demonstration
function animateVolumes() {
  const newVolumes = volumes.value.map(() => {
    return Math.random() * 0.8 + 0.2; // Random value between 0.2 and 1
  });

  volumes.value = newVolumes;
  animationId = window.setTimeout(animateVolumes, 200);
}

onMounted(() => {
  animateVolumes();
});

onUnmounted(() => {
  if (animationId !== null) {
    clearTimeout(animationId);
  }
});
</script>
