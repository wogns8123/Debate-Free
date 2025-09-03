<!-- components/ui/Avatar.vue -->
<template>
    <!-- Root -->
    <div
        v-if="!isImage"
        :class="['relative flex w-10 h-10 shrink-0 overflow-hidden rounded-full', className]"
        data-slot="avatar"
    >
        <slot name="fallback">
            <div
                class="bg-muted flex w-full h-full items-center justify-center rounded-full text-sm text-gray-600"
                data-slot="avatar-fallback"
            >
                {{ fallbackText }}
            </div>
        </slot>
    </div>

    <img
        v-else
        :src="src"
        :alt="alt"
        :class="['aspect-square w-full h-full object-cover', className]"
        data-slot="avatar-image"
        @error="onError"
    />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
    src?: string;
    alt?: string;
    fallbackText?: string;
    className?: string;
}

const props = defineProps<Props>();
const error = ref(false);

const onError = () => {
    error.value = true;
};

const isImage = computed(() => props.src && !error.value);
const fallbackText = computed(() => props.fallbackText || '');
</script>
