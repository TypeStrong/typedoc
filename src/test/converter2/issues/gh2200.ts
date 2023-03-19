declare function buildObj<T>(x: T): {
    [K in keyof T]?: 1;
};

export const Test = buildObj({ x: 1 });
