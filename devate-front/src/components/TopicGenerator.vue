<template>
    <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center">
            <span class="font-medium">현재 주제:</span>
            <Button size="sm" @click="$emit('generate-topic')">🔄 새 주제</Button>
        </div>
        <p class="p-4 bg-gray-100 rounded-md">{{ currentTopic || '토픽을 생성해주세요' }}</p>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { Button } from './ui';

const props = defineProps<{
    currentTopic: string;
}>();
</script>
