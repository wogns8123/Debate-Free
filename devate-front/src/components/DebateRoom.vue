<template>
    <div class="p-4 space-y-6">
        <!-- Debate Topic -->
        <div class="text-center mb-4">
            <h2 class="text-2xl font-bold">{{ room.name }}</h2>
            <p class="text-sm text-muted-foreground">Room ID: {{ room.id }}</p>
        </div>

        <!-- Timer -->
        <DebateTimer :timeRemaining="timeRemaining" :isRunning="isRunning" />

        <!-- Participants -->
        <ParticipantList :participants="participants" />

        <!-- Argument Input -->
        <ArgumentInput
            @submitArgument="addArgument"
            :participantId="currentUserId"
            :side="currentUserSide"
        />

        <!-- Arguments List -->
        <ArgumentsList :debateArguments="arguments" :participants="participants" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Participant, Argument } from '../App';
import DebateTimer from './DebateTimer.vue';
import ParticipantList from './ParticipantList.vue';
import ArgumentInput from './ArgumentInput.vue';
import ArgumentsList from './ArgumentsList.vue';

interface Room {
    id: string;
    name: string;
}

const props = defineProps<{
    room: Room;
    currentUserId: string;
    currentUserSide: 'for' | 'against';
}>();

const room = props.room;
const currentUserId = props.currentUserId;
const currentUserSide = props.currentUserSide;

// Participants and arguments
const participants = ref<Participant[]>([]);
const arguments = ref<Argument[]>([]);

// Timer
const timeRemaining = ref(300); // 예: 5분
const isRunning = ref(false);
let timerInterval: number | undefined;

// Timer logic
const startTimer = () => {
    if (isRunning.value) return;
    isRunning.value = true;
    timerInterval = window.setInterval(() => {
        if (timeRemaining.value > 0) {
            timeRemaining.value--;
        } else {
            stopTimer();
        }
    }, 1000);
};

const stopTimer = () => {
    isRunning.value = false;
    if (timerInterval) clearInterval(timerInterval);
};

// Add argument
const addArgument = (text: string) => {
    arguments.value.push({
        id: Date.now().toString(),
        participantId: currentUserId,
        text,
        side: currentUserSide,
        timestamp: Date.now(),
    });
};

// Mock participants (실제 API 연결 시 교체)
onMounted(() => {
    participants.value = [
        { id: '1', name: 'Alice', side: 'for', color: 'bg-green-500' },
        { id: '2', name: 'Bob', side: 'against', color: 'bg-red-500' },
    ];
});

onUnmounted(() => {
    stopTimer();
});
</script>
