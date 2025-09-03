<template>
    <label
        data-slot="label"
        :class="[
            'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            className,
        ]"
        v-bind="attrs"
    >
        <slot />
    </label>
</template>

<script setup lang="ts">
import { useAttrs, defineProps } from 'vue';

const props = defineProps<{
    className?: string;
}>();

// React의 ...props 대신 Vue에서는 useAttrs 사용
const attrs = useAttrs();
</script>
