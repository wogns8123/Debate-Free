<template>
    <div
        class="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4"
    >
        <h1 class="text-3xl font-bold text-purple-700 mb-6">💬 {{ roomName }}</h1>

        <div class="flex-1 overflow-auto mb-4">
            <div v-for="msg in messages" :key="msg.id" class="mb-2">
                <span class="font-semibold">{{ msg.user }}:</span> {{ msg.text }}
            </div>
        </div>

        <div class="flex gap-2">
            <input
                v-model="newMessage"
                class="flex-1 p-2 border rounded"
                placeholder="메시지 입력"
            />
            <button @click="sendMessage" class="px-4 py-2 rounded bg-purple-600 text-white">
                전송
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

export default {
    setup() {
        const route = useRoute();
        const roomName = ref(`Room ${route.params.id}`);
        const messages = ref([
            { id: 1, user: 'Alice', text: '안녕하세요!' },
            { id: 2, user: 'Bob', text: '안녕하세요!' },
        ]);
        const newMessage = ref('');

        const sendMessage = () => {
            if (!newMessage.value) return;
            messages.value.push({ id: Date.now(), user: 'Me', text: newMessage.value });
            newMessage.value = '';
        };

        return { roomName, messages, newMessage, sendMessage };
    },
};
</script>
