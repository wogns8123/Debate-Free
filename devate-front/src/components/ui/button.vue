<template>
    <button
        :class="[
            'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all disabled:opacity-50',
            sizeClass,
            variantClass,
        ]"
        v-bind="$attrs"
    >
        <slot />
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}>();

const variantClass = computed(() => {
    switch (props.variant) {
        case 'destructive':
            return 'bg-red-600 text-white hover:bg-red-700';
        case 'outline':
            return 'border bg-white hover:bg-gray-100';
        case 'secondary':
            return 'bg-gray-200 text-gray-900 hover:bg-gray-300';
        case 'ghost':
            return 'hover:bg-gray-100';
        case 'link':
            return 'text-blue-600 underline-offset-4 hover:underline';
        default:
            return 'bg-blue-600 text-white hover:bg-blue-700';
    }
});

const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'h-8 px-3';
        case 'lg':
            return 'h-10 px-6';
        case 'icon':
            return 'size-9';
        default:
            return 'h-9 px-4';
    }
});
</script>
