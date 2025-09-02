<template>
    <div>
        <button
            @click="open = true"
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
            <slot name="trigger">Open Dialog</slot>
        </button>

        <Teleport to="body">
            <Transition name="fade">
                <div
                    v-if="open"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                >
                    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6" @click.stop>
                        <header class="mb-4 text-lg font-semibold">
                            <slot name="title">Dialog Title</slot>
                        </header>
                        <div class="mb-4 text-sm text-gray-600">
                            <slot name="description">Dialog description goes here.</slot>
                        </div>
                        <footer class="flex justify-end gap-2">
                            <button
                                class="px-4 py-2 rounded border hover:bg-gray-100"
                                @click="open = false"
                            >
                                Cancel
                            </button>
                            <button
                                class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                @click="confirm"
                            >
                                Confirm
                            </button>
                        </footer>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);

const emit = defineEmits(['confirm', 'cancel']);

function confirm() {
    emit('confirm');
    open.value = false;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
