<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <ChatRoomCard
            v-for="room in rooms"
            :key="room.id"
            :room="room"
            @click="$emit('room-selected', room.id)"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import ChatRoomCard from './ChatRoomCard.vue';

interface Room {
    id: number;
    name: string;
    theme: string;
}

export default defineComponent({
    components: { ChatRoomCard },
    props: {
        rooms: {
            type: Array as PropType<Room[]>,
            required: true,
        },
    },
    emits: ['room-selected'],
});
</script>
