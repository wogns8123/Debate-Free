<template>
    <div class="min-h-screen bg-gray-100 flex flex-col">
        <!-- 헤더 -->
        <header class="bg-blue-600 text-white p-4 text-2xl font-bold shadow">
            천하제일 토론대회
        </header>

        <div class="flex flex-1 overflow-hidden p-4 gap-4">
            <!-- 좌측: 방 목록 -->
            <div class="w-1/3 bg-white p-4 rounded-lg shadow flex flex-col">
                <h2 class="text-xl font-semibold mb-4">채팅 방 목록</h2>

                <div class="flex mb-4 gap-2">
                    <input
                        v-model="newRoomName"
                        type="text"
                        placeholder="새 방 이름"
                        class="border rounded p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        @click="createRoom"
                        class="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 transition"
                    >
                        생성
                    </button>
                </div>

                <ul class="space-y-2 overflow-y-auto flex-1">
                    <li
                        v-for="room in rooms"
                        :key="room.roomId"
                        @click="joinRoom(room)"
                        class="cursor-pointer p-2 border rounded hover:bg-blue-50 transition"
                    >
                        {{ room.name }}
                    </li>
                </ul>
            </div>

            <!-- 우측: 채팅 영역 -->
            <div class="w-2/3 bg-white p-4 rounded-lg shadow flex flex-col">
                <div
                    v-if="currentRoom"
                    class="flex-1 flex flex-col overflow-y-auto mb-4"
                    ref="chatContainer"
                >
                    <div
                        v-for="(msg, index) in messages"
                        :key="index"
                        :class="[
                            'mb-2 max-w-xs p-2 rounded-lg break-words',
                            msg.sender === nickname
                                ? 'bg-blue-100 self-end text-right'
                                : 'bg-gray-200 self-start text-left',
                        ]"
                    >
                        <span class="font-semibold">{{ msg.sender }}:</span> {{ msg.text }}
                    </div>
                </div>

                <div v-else class="flex-1 flex items-center justify-center text-gray-500">
                    방을 선택해주세요
                </div>

                <!-- 입력창 -->
                <div v-if="currentRoom" class="flex gap-2">
                    <input
                        v-model="newMessage"
                        @keyup.enter="sendMessage"
                        type="text"
                        placeholder="메시지를 입력하세요"
                        class="flex-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        @click="sendMessage"
                        class="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 transition"
                    >
                        전송
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, onMounted, nextTick } from 'vue';

interface ChatRoom {
    roomId: string;
    name: string;
}

interface Message {
    sender: string;
    text: string;
}

export default {
    setup() {
        const rooms = ref<ChatRoom[]>([]);
        const currentRoom = ref<ChatRoom | null>(null);
        const nickname = ref('User1');
        const newRoomName = ref('');
        const messages = ref<Message[]>([]);
        const newMessage = ref('');
        const chatContainer = ref<HTMLElement | null>(null);

        const fetchRooms = async () => {
            try {
                const res = await fetch('http://localhost:8080/rooms');
                rooms.value = (await res.json()) as ChatRoom[];
            } catch (err) {
                console.error('방 목록 불러오기 실패', err);
            }
        };

        const createRoom = async () => {
            if (!newRoomName.value.trim()) return;
            try {
                const res = await fetch(
                    `http://localhost:8080/rooms?name=${encodeURIComponent(newRoomName.value)}`,
                    { method: 'POST' }
                );
                if (!res.ok) return console.error('방 생성 실패', res.status);
                newRoomName.value = '';
                await fetchRooms();
            } catch (err) {
                console.error('방 생성 중 오류', err);
            }
        };

        const joinRoom = (room: ChatRoom) => {
            currentRoom.value = room;
            messages.value = []; // 방 바뀌면 초기화
        };

        const sendMessage = () => {
            if (!newMessage.value.trim()) return;
            messages.value.push({
                sender: nickname.value,
                text: newMessage.value,
            });
            newMessage.value = '';
            nextTick(() => {
                if (chatContainer.value) {
                    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
                }
            });
        };

        onMounted(fetchRooms);

        return {
            rooms,
            currentRoom,
            nickname,
            newRoomName,
            createRoom,
            joinRoom,
            messages,
            newMessage,
            sendMessage,
            chatContainer,
        };
    },
};
</script>

<style scoped>
/* 스크롤바 꾸미기 */
::-webkit-scrollbar {
    width: 6px;
}
::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}
</style>
