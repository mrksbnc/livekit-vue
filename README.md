# LiveKit Vue

## Installation

Then you can install the package with:

```bash
npm install @mrksbnc/livekit-vue
```

## Usage

To enable livekit-vue in your project you need to import the compiled `css` file from the package in your `main.js`, and `main.ts` files.

```js
import '@mrksbnc/livekit-vue/dist/index.css';
```

After this, you can use the components like any other after importing them.

```html
<template>
  <lk-room :token="token" :server-url="serverUrl" />
</template>

<script setup lang="ts">
  import { LkRoom } from '@mrksbnc/livekit-vue';
</script>
```
