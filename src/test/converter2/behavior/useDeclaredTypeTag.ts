function getData() {
    return [{ abc: 123 }];
}

/** @useDeclaredType */
export type Data = ReturnType<typeof getData>;
