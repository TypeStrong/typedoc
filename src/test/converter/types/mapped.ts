export function mapped<T>(arg: T) {
    return {} as { -readonly [K in keyof T]?: string };
}

export type Mappy<T> = { [K in keyof T]: T[K] };
