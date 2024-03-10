export function f() {
    return 1;
}

/** doc */
export type ReturnOfF = ReturnType<typeof f>;
