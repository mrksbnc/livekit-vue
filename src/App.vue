<template>
  <div class="app align-center flex h-screen flex-col justify-center bg-gray-900 text-white">
    <VideoControls />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import './index.css';

import { Room } from 'livekit-client';
import VideoControls from './components/VideoControls.vue';
import { useProvideRoomContext } from './context';
import { useProvideConnectionStateContext } from './context/connection_state.context';

useProvideRoomContext(new Room());
useProvideConnectionStateContext();

// Connection details
const url = ref('');
const token = ref('');
const roomName = ref('');
const isConnected = ref(true);

function connect() {
  // if (url.value && token.value) {
  isConnected.value = true;
  // }
}

function onConnected() {
  console.log('Connected to LiveKit room');
}

function onDisconnected() {
  isConnected.value = false;
  console.log('Disconnected from LiveKit room');
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
}

/* Responsive styles */
@media (max-width: 768px) {
  /* Tablet */
  header {
    padding: 0.75rem;
  }

  header h1 {
    font-size: 1.5rem;
  }

  header .flex-col.sm\:flex-row {
    gap: 0.5rem;
  }

  header input {
    padding: 0.375rem 0.75rem;
  }

  header button {
    padding: 0.375rem 0.75rem;
  }
}

@media (max-width: 640px) {
  /* Mobile */
  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.5rem;
  }

  header h1 {
    font-size: 1.25rem;
  }

  header .flex-items-center.gap-4 {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  header input {
    width: 100%;
    padding: 0.375rem 0.5rem;
  }

  header button {
    width: 100%;
    padding: 0.375rem 0.5rem;
  }

  footer {
    font-size: 0.75rem;
    padding: 0.5rem;
  }

  .text-center.max-w-md {
    max-width: 90%;
    padding: 1rem;
  }

  .text-center.max-w-md h2 {
    font-size: 1.125rem;
  }

  .text-center.max-w-md svg {
    height: 3rem;
    width: 3rem;
  }
}
</style>
