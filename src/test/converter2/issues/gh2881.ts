export interface Callable {
    (): string;
}

export const fnByDefault = () => "";

export const notFn: Callable = () => "";

/** @function */
export const fnByTag: Callable = () => "";
