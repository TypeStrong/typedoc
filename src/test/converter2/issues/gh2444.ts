function Comparable<T>(impl: { compare(a: T, b: T): number }) {
    return {
        ...impl,

        equal(a: T, b: T) {
            return impl.compare(a, b) === 0;
        },
    };
}

const BooleanComparable = Comparable<boolean>({
    compare(a, b) {
        return +a - +b;
    },
});

/** @namespace */
export const Boolean = {
    ...BooleanComparable,
    hasInstance(value: unknown): value is boolean {
        return typeof value === "boolean";
    },
};

const NumberComparable = Comparable<number>({
    compare(left, right) {
        return left === right ? 0 : left < right ? -1 : 1;
    },
});

/** @namespace */
export const Number = {
    ...NumberComparable,
    hasInstance(value: unknown): value is number {
        return typeof value === "number";
    },
};
