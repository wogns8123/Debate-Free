<template>
    <textarea
        data-slot="textarea"
        v-bind="$attrs"
        :class="[
            'resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            customClass,
        ]"
    ></textarea>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Textarea',
    inheritAttrs: false,
    props: {
        class: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const customClass = props.class;
        return { customClass };
    },
});
</script>
