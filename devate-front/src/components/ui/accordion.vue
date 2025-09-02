<template>
    <div class="border rounded-md divide-y">
        <div v-for="(item, i) in items" :key="i" class="border-b last:border-b-0">
            <button
                class="w-full flex justify-between items-center py-4 px-2 text-left text-sm font-medium hover:underline"
                @click="toggle(i)"
            >
                <span>{{ item.title }}</span>
                <svg
                    class="w-4 h-4 transition-transform duration-200"
                    :class="{ 'rotate-180': openIndex === i }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>
            <Transition name="accordion">
                <div v-if="openIndex === i" class="px-2 pb-4 text-sm">
                    {{ item.content }}
                </div>
            </Transition>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface AccordionItem {
    title: string;
    content: string;
}

const props = defineProps<{
    items: AccordionItem[];
}>();

const openIndex = ref<number | null>(null);

function toggle(index: number) {
    openIndex.value = openIndex.value === index ? null : index;
}
</script>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
    transition: all 0.3s ease;
    max-height: 200px;
}
.accordion-enter-from,
.accordion-leave-to {
    opacity: 0;
    max-height: 0;
}
</style>
