<template>
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div class="bg-white rounded-xl p-6 w-96">
            <h3 class="text-lg font-bold mb-4">채팅방 만들기</h3>
            <input
                v-model="roomName"
                placeholder="방 이름"
                class="w-full p-2 border rounded mb-4"
            />
            <select v-model="theme" class="w-full p-2 border rounded mb-4">
                <option>환경</option>
                <option>기술</option>
                <option>문화</option>
                <option>정치</option>
                <option>스포츠</option>
            </select>
            <div class="flex justify-end gap-2">
                <button @click="$emit('close')" class="px-4 py-2 rounded bg-gray-300">취소</button>
                <button @click="createRoom" class="px-4 py-2 rounded bg-purple-600 text-white">
                    생성
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ref } from 'vue';
export default {
    emits: ['close', 'create'],
    setup(_, { emit }) {
        const roomName = ref('');
        const theme = ref('환경');

        const createRoom = () => {
            if (!roomName.value) return alert('방 이름을 입력해주세요.');
            emit('create', { id: Date.now(), name: roomName.value, theme: theme.value });
            emit('close');
        };

        return { roomName, theme, createRoom };
    },
};
</script>
