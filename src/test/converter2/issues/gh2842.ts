declare function defineComponent<
    T extends Record<string, () => any>,
    U extends Record<string, any>,
>(component: {
    computed: T;
    props: U;
}): new () => U & { [K in keyof T]: ReturnType<T[K]> };

/** @class */
export const ComputedClass = defineComponent({
    computed: {
        hello() {
            return "hello";
        },
    },
    props: {
        name: "world",
    },
});
