<template>
  <div class="min-h-screen bg-background">
    <LandingPage 
      v-if="currentView === 'landing'"
      :allDebates="allDebates"
      @join-debate="handleJoinDebate"
      @create-debate="handleCreateDebate"
    />

    <DebateRoom 
      v-else
      v-if="currentDebate"
      :debate="currentDebate"
      @leave-debate="handleLeaveDebate"
      @update-debate="handleUpdateDebate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LandingPage from './components/LandingPage.vue';
import DebateRoom from './components/DebateRoom.vue';
import type { Debate } from './types';

const currentView = ref<'landing' | 'debate'>('landing');
const currentDebate = ref<Debate | null>(null);
const allDebates = ref<Debate[]>([]);

const handleJoinDebate = (debate: Debate) => {
  currentDebate.value = debate;
  currentView.value = 'debate';
};

const handleCreateDebate = (debate: Debate) => {
  allDebates.value.push(debate);
  currentDebate.value = debate;
  currentView.value = 'debate';
};

const handleLeaveDebate = () => {
  currentDebate.value = null;
  currentView.value = 'landing';
};

const handleUpdateDebate = (updatedDebate: Debate) => {
  currentDebate.value = updatedDebate;
  allDebates.value = allDebates.value.map(d =>
    d.id === updatedDebate.id ? updatedDebate : d
  );
};
</script>
