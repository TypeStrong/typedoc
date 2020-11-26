export function mapped<T>(arg: T) {
    return {} as { -readonly [K in keyof T]?: string };
}

export type Mappy<T> = { [K in keyof T]: T[K] };

export type DoubleKey<T> = { [K in keyof T & string as `${K}${K}`]: T[K] };

export function doubleKey<T>(arg: T) {
    return {} as { [K in keyof T & string as `${K}${K}`]: T[K] };
}
