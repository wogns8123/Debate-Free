<template>
    <div
        class="relative flex size-10 shrink-0 overflow-hidden rounded-full"
        role="img"
        aria-label="avatar"
    >
        <img
            v-if="src && !error"
            :src="src"
            :alt="alt"
            class="aspect-square size-full object-cover"
            @error="error = true"
        />
        <div
            v-else
            class="bg-muted flex size-full items-center justify-center rounded-full text-sm text-gray-600"
        >
            <slot name="fallback">{{ fallbackText }}</slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    src?: string;
    alt?: string;
    fallbackText?: string;
}>();

const error = ref(false);
</script>
