<template>
    <div class="relative w-full" :style="{ paddingBottom: `${(1 / ratio) * 100}%` }">
        <div class="absolute inset-0">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    ratio?: number;
}>();

const ratio = props.ratio ?? 16 / 9;
</script>
