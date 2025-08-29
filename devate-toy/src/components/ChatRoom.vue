<template>
    <div class="p-4 border-t">
        <h3 class="font-bold mb-2">채팅 - {{ room?.name }}</h3>
        <div class="h-64 overflow-y-auto border p-2 mb-2">
            <div v-for="msg in messages" :key="msg.id">
                <strong>{{ msg.user }}:</strong> {{ msg.text }}
            </div>
        </div>

        <div class="flex">
            <input
                v-model="text"
                type="text"
                placeholder="메시지 입력"
                class="border p-2 flex-1 mr-2"
                @keyup.enter="sendMessage"
            />
            <button @click="sendMessage" class="bg-green-500 text-white px-4 rounded">전송</button>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, onUnmounted } from 'vue';

interface Message {
    id: string;
    user: string;
    text: string;
}

export default {
    props: {
        room: Object,
        nickname: String,
    },
    setup(props) {
        const messages = ref<Message[]>([]);
        const text = ref('');
        let ws: WebSocket | null = null;

        const connectWebSocket = () => {
            if (!props.room) return;
            ws = new WebSocket(`ws://localhost:8080/ws/chat/${props.room.roomId}`);

            ws.onopen = () => console.log('WebSocket 연결 성공');
            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                messages.value.push(msg);
            };
            ws.onclose = () => console.log('WebSocket 연결 종료');
            ws.onerror = (err) => console.error('WebSocket 에러', err);
        };

        const sendMessage = () => {
            if (!text.value.trim() || !ws) return;
            const msg = { user: props.nickname, text: text.value };
            ws.send(JSON.stringify(msg));
            text.value = '';
        };

        // 컴포넌트가 마운트되면 바로 WebSocket 연결
        connectWebSocket();

        onUnmounted(() => {
            if (ws) ws.close();
        });

        return { messages, text, sendMessage };
    },
};
</script>
