<template>
  <button :disabled="disabled" :class="staticClasses">
    <PhoneHangUpSvg class="h-5 w-5" />
  </button>
</template>

<script setup lang="ts">
import PhoneHangUpSvg from '@/assets/icons/phone-hang-up.svg?component';
import type { DisconnectButtonProps } from './buttons';

import { useDisconnectButton } from '@/composables';
import '@/index.css';
import { computed } from 'vue';

const props = defineProps<DisconnectButtonProps>();

const disconnectButton = useDisconnectButton(props);

const disabled = computed<boolean>(() => disconnectButton.disabled.value);

const staticClasses =
  /*tw*/ 'cursor-pointer p-2.5 bg-red-700 bg-opacity-5 hover:bg-red-800 text-white rounded-md';
</script>
