<template>
    <div
        class="relative w-full rounded-lg border px-4 py-3 text-sm grid grid-cols-[1.5rem_1fr] gap-x-3 items-start"
        :class="variantClass"
        role="alert"
    >
        <slot name="icon">
            <svg
                v-if="variant === 'destructive'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-red-500 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        </slot>

        <div>
            <div class="font-medium tracking-tight">
                <slot name="title">Alert title</slot>
            </div>
            <div class="text-gray-600 text-sm mt-1">
                <slot name="description">Alert description goes here.</slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    variant?: 'default' | 'destructive';
}>();

const variantClass = computed(() => {
    if (props.variant === 'destructive') {
        return 'border-red-500 bg-red-50 text-red-700';
    }
    return 'border-gray-300 bg-white text-gray-900';
});
</script>
