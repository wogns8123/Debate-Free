<template>
    <div class="relative inline-block w-full" :class="className">
        <button
            type="button"
            class="border-input flex w-full items-center justify-between rounded-md border bg-input-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            @click="toggleOpen"
        >
            <span>{{ selectedLabel }}</span>
            <ChevronDownIcon class="size-4 opacity-50" />
        </button>

        <div
            v-if="open"
            class="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover shadow-md"
        >
            <div v-for="item in items" :key="item.value">
                <button
                    class="w-full px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground flex justify-between items-center"
                    @click="selectItem(item)"
                >
                    <span>{{ item.label }}</span>
                    <CheckIcon v-if="item.value === modelValue" class="size-4" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import { CheckIcon, ChevronDownIcon } from 'lucide-vue-next';

interface SelectItem {
    value: string | number;
    label: string;
}

const props = defineProps<{
    modelValue: string | number;
    items: SelectItem[];
    className?: string;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number): void;
}>();

const open = ref(false);

const toggleOpen = () => {
    open.value = !open.value;
};

const selectItem = (item: SelectItem) => {
    emit('update:modelValue', item.value);
    open.value = false;
};

const selectedLabel = computed(() => {
    const selected = props.items.find((i) => i.value === props.modelValue);
    return selected ? selected.label : 'Select...';
});
</script>
