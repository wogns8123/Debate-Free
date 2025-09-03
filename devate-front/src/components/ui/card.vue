<script lang="ts">
import { defineComponent, h, useAttrs } from 'vue';

// Card
export const Card = defineComponent({
    name: 'Card',
    setup(_, { slots }) {
        const attrs = useAttrs();
        return () =>
            h(
                'div',
                {
                    ...attrs,
                    class: 'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border',
                },
                slots.default?.()
            );
    },
});

// CardHeader
export const CardHeader = defineComponent({
    name: 'CardHeader',
    setup(_, { slots }) {
        const attrs = useAttrs();
        return () =>
            h(
                'div',
                {
                    ...attrs,
                    class: '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
                },
                slots.default?.()
            );
    },
});

// CardTitle
export const CardTitle = defineComponent({
    name: 'CardTitle',
    setup(_, { slots }) {
        const attrs = useAttrs();
        return () => h('h4', { ...attrs, class: 'leading-none' }, slots.default?.());
    },
});

// CardDescription
export const CardDescription = defineComponent({
    name: 'CardDescription',
    setup(_, { slots }) {
        const attrs = useAttrs();
        return () => h('p', { ...attrs, class: 'text-muted-foreground' }, slots.default?.());
    },
});

// CardContent
export const CardContent = defineComponent({
    name: 'CardContent',
    setup(_, { slots }) {
        const attrs = useAttrs();
        return () => h('div', { ...attrs, class: 'px-6 [&:last-child]:pb-6' }, slots.default?.());
    },
});

// CardFooter
export const CardFooter = defineComponent({
    name: 'CardFooter',
    setup(_, { slots }) {
        const attrs = useAttrs();
        return () =>
            h(
                'div',
                { ...attrs, class: 'flex items-center px-6 pb-6 [.border-t]:pt-6' },
                slots.default?.()
            );
    },
});

// CardAction
export const CardAction = defineComponent({
    name: 'CardAction',
    setup(_, { slots }) {
        const attrs = useAttrs();
        return () =>
            h(
                'div',
                {
                    ...attrs,
                    class: 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
                },
                slots.default?.()
            );
    },
});
</script>
