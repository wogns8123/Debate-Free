<template>
    <span
        class="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-colors"
        :class="variantClasses"
    >
        <slot />
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}>();

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'secondary':
            return 'bg-secondary text-secondary-foreground';
        case 'destructive':
            return 'bg-destructive text-white';
        case 'outline':
            return 'border text-foreground';
        default:
            return 'bg-primary text-primary-foreground';
    }
});
</script>
