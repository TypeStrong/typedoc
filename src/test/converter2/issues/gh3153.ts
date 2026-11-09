export interface Box<T, U = string> {
    t: T;
    u: U;
}

export interface Base<D> {
    value: D;
    select?(data: D): void;
}

export interface Derived extends Base<Box<number, string>> {}

export type Mapped<T> = { [K in keyof T]: Promise<T[K]> };

export interface DerivedMapped extends Base<Mapped<Box<number, string>>> {}

export class BaseClass<D> {
    value!: D;

    get(): D {
        return this.value;
    }
}

export class DerivedClass extends BaseClass<Map<string, number>> {}

export interface Direct {
    value: Box<number>;
}
