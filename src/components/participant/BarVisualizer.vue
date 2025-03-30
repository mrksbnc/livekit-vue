<template>
  <div :data-lk-va-state="state" class="lk-audio-bar-visualizer">
    <span
      v-for="(volume, idx) in frequencyBands"
      :key="idx"
      :data-lk-highlighted="highlightedIndices.includes(idx)"
      :data-lk-bar-index="idx"
      :class="['lk-audio-bar', highlightedIndices.includes(idx) ? 'lk-highlighted' : '']"
      :style="{
        height: `${Math.min(maxHeight, Math.max(minHeight, volume * 100 + 5))}%`,
      }"
    ></span>
  </div>
</template>

<script setup lang="ts">
import { useMultibandTrackVolume } from '@/composables';
import { sequencerIntervals } from '@/composables/useTrackVolume';
import { useTrackRefContext } from '@/context';
import { onUnmounted, ref, watch } from 'vue';
import type { AgentState, BarVisualizerProps } from './bar_visualizer';

const props = withDefaults(defineProps<BarVisualizerProps>(), {
  barCount: 15,
});

const trackReference = useTrackRefContext();

const currentIndex = ref<number>(0);
const highlightedIndices = ref<number[]>([]);
const animationInterval = ref<number | undefined>(0);

const minHeight = ref<number>(props.options?.minHeight ?? 20);
const maxHeight = ref<number>(props.options?.maxHeight ?? 100);

const { frequencyBands } = useMultibandTrackVolume({
  trackOrTrackReference: trackReference,
  options: {
    loPass: 100,
    hiPass: 200,
    bands: props.barCount,
  },
});

const getSequencerInterval = (state: AgentState | undefined, barCount: number): number => {
  if (state === undefined) {
    return 1000;
  }

  let interval = sequencerIntervals[state];
  if (interval) {
    if (state === 'connecting') {
      interval /= barCount;
    }
  }

  return interval ?? 100;
};

const updateHighlightedBars = (): void => {
  if (!props.state) {
    highlightedIndices.value = [];
    return;
  }

  const newIndices: number[] = [];

  // Different animation patterns for different states
  switch (props.state) {
    case 'connecting':
      newIndices.push(currentIndex.value % props.barCount);
      break;
    case 'initializing':
      for (let i = 0; i < 3; i++) {
        newIndices.push((currentIndex.value + i) % props.barCount);
      }
      break;
    case 'listening':
      for (let i = 0; i < 4; i += 2) {
        newIndices.push((currentIndex.value + i) % props.barCount);
      }
      break;
    case 'thinking':
      // Random indices for thinking state
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        newIndices.push(Math.floor(Math.random() * props.barCount));
      }
      break;
  }

  highlightedIndices.value = newIndices;
  currentIndex.value = (currentIndex.value + 1) % props.barCount;
};

watch(
  () => props.state,
  (newState) => {
    if (animationInterval.value) {
      clearInterval(animationInterval.value);
      animationInterval.value = undefined;
    }

    if (newState) {
      const interval = getSequencerInterval(newState, props.barCount);
      animationInterval.value = window.setInterval(updateHighlightedBars, interval);
    } else {
      highlightedIndices.value = [];
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (animationInterval.value) {
    clearInterval(animationInterval.value);
  }
});
</script>
