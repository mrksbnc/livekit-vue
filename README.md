# livekit-vue

Vue implementation of the LiveKit componen-js library.

## Installation

To add this package to your project, run:

```bash
npm install @mrksbnc/livekit-vue
```

## Usage

```vue
<template>
  <lk-room :token="token" :server-url="serverUrl" />
</template>

<script setup lang="ts">
import { LkRoom } from '@mrksbnc/livekit-vue';
</script>
```
