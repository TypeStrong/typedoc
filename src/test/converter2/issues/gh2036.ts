export declare const SingleSimpleCtor: {
    new (a: string, b: string): Array<string>;
};

export declare const MultipleSimpleCtors: {
    new (a: string, b: string): Array<string>;
    new (a: string, b: number): Array<string | number>;
};

export const AnotherCtor = null! as new (a: string) => Object;
