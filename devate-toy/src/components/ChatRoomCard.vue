<template>
    <div
        class="bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition"
        @click="$emit('click')"
    >
        <h2 class="text-xl font-semibold mb-2">{{ room.name }}</h2>
        <p class="text-sm text-gray-500">테마: {{ room.theme }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue'; // ← type-only import

interface Room {
    id: number;
    name: string;
    theme: string;
}

export default defineComponent({
    props: {
        room: {
            type: Object as PropType<Room>,
            required: true,
        },
    },
});
</script>
