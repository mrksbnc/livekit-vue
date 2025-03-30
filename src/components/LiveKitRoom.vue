<template>
  <div class="lk-room h-full w-full">
    <slot name="room" />
  </div>
</template>

<script setup lang="ts">
import { useLiveKitRoom } from '@/composables';
import { useProvideRoomContext } from '@/context/room.context';
import type { LiveKitRoomProps } from '@/types/livekit_room.types';
import { computed, watchEffect } from 'vue';

const props = defineProps<LiveKitRoomProps>();

const emit = defineEmits<{
  (e: 'connected'): void;
  (e: 'disconnected'): void;
  (e: 'error', error: Error): void;
}>();

const roomProps = computed(() => ({
  ...props,
  onConnected: () => emit('connected'),
  onDisconnected: () => emit('disconnected'),
  onError: (error: Error) => emit('error', error),
}));

const { room } = useLiveKitRoom(roomProps.value);

// Provide the room context to child components
watchEffect(() => {
  if (room.value) {
    useProvideRoomContext(room.value);
  }
});
</script>
