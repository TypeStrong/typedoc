/** I am documented, but the validator thinks otherwise. */
export type FunctionType = (foo: string) => string;

export type UnDocFn = (foo: string) => string;

/** This docblock works fine. */
export class ExampleClass {
    /** This wrongly complains about not being documented */
    [Symbol.iterator]() {
        return {
            /** This also says it's not documented. */
            index: 0,
            /** This one too. */
            next(): IteratorResult<number> {
                return { done: false, value: this.index++ };
            },
        };
    }

    /**
     * @hidden
     */
    [Symbol.asyncIterator]() {
        return {
            // This does _not_ complain, which is what I would expect.
            index: 0,
            // Even though it's not rendered in the final docs, it still complains
            // that this isn't documented.
            async next(): Promise<IteratorResult<number>> {
                return { done: false, value: this.index++ };
            },
        };
    }
}
