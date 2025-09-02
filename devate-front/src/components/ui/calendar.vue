<template>
    <div class="p-4 border rounded-md">
        <input type="date" v-model="date" class="border rounded px-2 py-1" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const date = ref('');
</script>
