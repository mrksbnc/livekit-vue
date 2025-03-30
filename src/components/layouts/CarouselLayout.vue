<template>
  <div class="lk-carousel-layout flex h-full w-full flex-col">
    <!-- The main content area -->
    <div
      class="lk-carousel-main relative flex flex-1 items-center justify-center bg-gray-900 p-4"
      v-if="activeFocusItem"
    >
      <slot
        name="activeFocusItem"
        :item="activeFocusItem"
      ></slot>
    </div>

    <!-- Placeholder when no active item -->
    <div
      v-else
      class="lk-carousel-empty flex flex-1 items-center justify-center bg-gray-900 p-4"
    >
      <div class="max-w-md rounded-lg bg-gray-800 p-8 text-center shadow-lg">
        <svg
          class="mx-auto mb-4 h-16 w-16 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="text-gray-400">No item selected</p>
      </div>
    </div>

    <!-- The carousel strip -->
    <div class="lk-carousel-container relative mt-2 h-24">
      <div
        ref="scrollContainer"
        class="lk-carousel-items flex h-full space-x-2 overflow-x-auto pb-2"
      >
        <slot></slot>
      </div>

      <!-- Navigation buttons -->
      <button
        v-if="canScrollLeft"
        @click="scrollLeft"
        class="lk-carousel-nav-left absolute top-1/2 left-0 z-10 flex h-16 w-8 -translate-y-1/2 transform items-center justify-center rounded-r-md bg-gray-800/80 text-white hover:bg-gray-700"
        aria-label="Scroll left"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        v-if="canScrollRight"
        @click="scrollRight"
        class="lk-carousel-nav-right absolute top-1/2 right-0 z-10 flex h-16 w-8 -translate-y-1/2 transform items-center justify-center rounded-l-md bg-gray-800/80 text-white hover:bg-gray-700"
        aria-label="Scroll right"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

defineProps<{
  activeFocusItem?: unknown;
}>();

const scrollContainer = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

function checkScrollability() {
  if (!scrollContainer.value) return;

  canScrollLeft.value = scrollContainer.value.scrollLeft > 0;

  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 10; // 10px buffer
}

function scrollLeft() {
  if (!scrollContainer.value) return;

  const containerWidth = scrollContainer.value.clientWidth;
  scrollContainer.value.scrollBy({
    left: -containerWidth / 2, // Scroll half a container width
    behavior: 'smooth',
  });
}

function scrollRight() {
  if (!scrollContainer.value) return;

  const containerWidth = scrollContainer.value.clientWidth;
  scrollContainer.value.scrollBy({
    left: containerWidth / 2, // Scroll half a container width
    behavior: 'smooth',
  });
}

function onScroll() {
  checkScrollability();
}

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', onScroll);

    // Initial check after content is fully rendered
    nextTick(() => {
      checkScrollability();
    });
  }

  // Re-check on window resize
  window.addEventListener('resize', checkScrollability);
});

onBeforeUnmount(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', onScroll);
  }
  window.removeEventListener('resize', checkScrollability);
});
</script>

<style scoped>
.lk-carousel-items {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) rgba(31, 41, 55, 0.5);
}

.lk-carousel-items::-webkit-scrollbar {
  height: 6px;
}

.lk-carousel-items::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 3px;
}

.lk-carousel-items::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

/* Responsive styles */
@media (max-width: 768px) {
  /* Tablet */
  .lk-carousel-layout {
    gap: 0.5rem;
  }

  .lk-carousel-main {
    padding: 0.5rem;
  }

  .lk-carousel-container {
    height: 20px;
  }

  .lk-carousel-nav-left,
  .lk-carousel-nav-right {
    height: 12px;
    width: 6px;
  }

  .lk-carousel-nav-left svg,
  .lk-carousel-nav-right svg {
    width: 10px;
    height: 10px;
  }
}

@media (max-width: 640px) {
  /* Mobile */
  .lk-carousel-layout {
    gap: 0.25rem;
  }

  .lk-carousel-main {
    padding: 0.25rem;
  }

  .lk-carousel-empty .max-w-md {
    max-width: 90%;
    padding: 1rem;
  }

  .lk-carousel-empty svg {
    height: 2.5rem;
    width: 2.5rem;
  }

  .lk-carousel-empty p {
    font-size: 0.875rem;
  }
}
</style>
