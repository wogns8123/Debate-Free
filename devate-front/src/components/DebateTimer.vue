<template>
    <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
            <Clock :class="`w-5 h-5 ${isRunning ? 'animate-pulse' : ''}`" />
            <div class="text-right">
                <div class="font-mono text-lg font-medium">{{ formattedTime }}</div>
                <div class="text-xs text-muted-foreground">{{ statusText }}</div>
            </div>
        </div>

        <Badge :variant="timeColor">
            {{ badgeText }}
        </Badge>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Clock } from 'lucide-vue-next';
import { Badge } from './ui/badge';

interface Props {
    timeRemaining: number;
    isRunning: boolean;
}

const props = defineProps<Props>();

const formattedTime = computed(() => {
    const minutes = Math.floor(props.timeRemaining / 60);
    const seconds = props.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const timeColor = computed(() => {
    if (props.timeRemaining <= 60) return 'destructive';
    if (props.timeRemaining <= 180) return 'secondary';
    return 'default';
});

const statusText = computed(() => {
    if (!props.isRunning && props.timeRemaining > 0) return 'Paused';
    if (props.timeRemaining <= 0) return 'Time Up!';
    return 'Active';
});

const badgeText = computed(() => {
    if (props.timeRemaining <= 0) return 'Finished';
    return props.isRunning ? 'Running' : 'Paused';
});
</script>
