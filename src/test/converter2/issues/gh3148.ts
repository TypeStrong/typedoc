export class AccessorBase<T> {
    /** The inherited getter keeps its comment. */
    get value(): T {
        throw new Error();
    }

    get wrapped(): { entry: T } {
        throw new Error();
    }

    get self(): this {
        return this;
    }

    get paired(): T {
        throw new Error();
    }

    set paired(value: T | null) {
        void value;
    }

    method(): T {
        throw new Error();
    }
}

export class StringAccessor extends AccessorBase<string> {}

export class ListAccessor<U> extends AccessorBase<U[]> {}

export class NumberListAccessor extends ListAccessor<number> {}
