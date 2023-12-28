const times = (b: number) => (a: number) => a * b;

export const double = times(2);

export const foo = () => 123;

export const all: {
    <T>(fn: (item: T) => boolean, iterator: Iterable<T>): boolean;
    <T>(fn: (item: T) => boolean): (iterator: Iterable<T>) => boolean;
} = () => false as any;
