<template>
    <div class="p-8">
        <h1 class="text-4xl font-bold mb-6">🌏 랜덤 토론 사이트</h1>

        <button
            @click="showModal = true"
            class="mb-8 px-6 py-3 bg-purple-600 text-white rounded-xl"
        >
            랜덤 채팅방 만들기
        </button>

        <!-- ChatRoomList로 방 목록 출력 -->
        <ChatRoomList :rooms="rooms" @room-selected="goToRoom" />

        <CreateRoomModal v-if="showModal" @close="showModal = false" @create="createRoom" />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ChatRoomList from '../components/ChatRoomList.vue';
import CreateRoomModal from '../components/CreateRoomModal.vue';

export default defineComponent({
    components: { ChatRoomList, CreateRoomModal },
    setup() {
        const rooms = ref([
            { id: 1, name: '환경 보호', theme: '환경' },
            { id: 2, name: 'AI 기술', theme: '기술' },
            { id: 3, name: '영화 토론', theme: '문화' },
        ]);

        const showModal = ref(false);

        const createRoom = (newRoom: any) => rooms.value.push(newRoom);
        const goToRoom = (id: number) => (window.location.href = `/room/${id}`);

        return { rooms, showModal, createRoom, goToRoom };
    },
});
</script>
