export interface Edges<T extends string> {
    (): string;
    (x: string): void;
    new (): Object;

    prop: string;
    get getter(): T;

    [index: string]: string;
}

// Should render similarly to Edges
export type Edges2<T extends string> = {
    (): string;
    (x: string): void;
    new (): Object;

    prop: string;
    get getter(): T;

    [index: string]: string;
};

export type NotLifted = () => string;

export type Ctor = new () => string;
