export type AliasA = Readonly<Record<string, string>>;

export type AliasB<T> = Readonly<Record<string, T>>;

export type AliasC = Readonly<{}>;

export interface InterfaceA {
    propertyA: AliasA;
    propertyB: AliasB<string>;
    propertyC: AliasC;
}
