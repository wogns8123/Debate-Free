<template>
    <div class="grid gap-4">
        <Card
            v-for="debate in debates"
            :key="debate.id"
            class="cursor-pointer hover:shadow-md transition"
            @click="$emit('join-debate', debate)"
        >
            <CardContent class="flex justify-between items-center">
                <div>
                    <h3 class="font-semibold text-lg">{{ debate.topic }}</h3>
                    <p class="text-sm text-muted-foreground">
                        참가자: {{ debate.participants.length }}명
                    </p>
                </div>
                <Badge :variant="debate.currentPhase === 'debating' ? 'destructive' : 'secondary'">
                    {{ debate.currentPhase === 'debating' ? '진행중' : '대기중' }}
                </Badge>
            </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { Card, CardContent, Badge } from './ui';
import type { Debate } from '../types';

const props = defineProps<{
    debates: Debate[];
}>();
</script>
