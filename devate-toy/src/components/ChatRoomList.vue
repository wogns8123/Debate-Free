<template>
    <div class="p-4 border">
        <h2 class="text-xl font-bold mb-2">채팅 방 목록</h2>

        <div class="flex mb-4">
            <input
                v-model="newRoomName"
                type="text"
                placeholder="새 방 이름"
                class="border p-2 flex-1 mr-2"
            />
            <button @click="createRoom" class="bg-blue-500 text-white px-4 rounded">
                방 만들기
            </button>
        </div>

        <ul>
            <li
                v-for="room in rooms"
                :key="room.roomId"
                @click="joinRoom(room)"
                class="cursor-pointer p-2 border-b hover:bg-gray-100"
            >
                {{ room.name }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';

interface ChatRoom {
    roomId: string;
    name: string;
}

export default {
    emits: ['room-selected'],
    setup(_, { emit }) {
        // rooms 타입 선언
        const rooms = ref<ChatRoom[]>([]);
        const newRoomName = ref('');

        // 방 목록 가져오기
        const fetchRooms = async () => {
            try {
                const res = await fetch('http://localhost:8080/rooms');
                const data = (await res.json()) as ChatRoom[]; // 타입 단언
                rooms.value = data;
                console.log('방 목록:', rooms.value);
            } catch (err) {
                console.error('방 목록 불러오기 실패', err);
            }
        };

        // 방 생성
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

        // 방 선택
        const joinRoom = (room: ChatRoom) => {
            emit('room-selected', room);
        };

        onMounted(() => fetchRooms());

        return { rooms, newRoomName, createRoom, joinRoom };
    },
};
</script>
