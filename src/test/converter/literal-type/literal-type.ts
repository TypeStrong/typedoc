let typeLiteral: {
    valueZ: string;
    valueY: {(): string; };
    valueX: {
        valueZ: string;
        valueY: {(z: string): {a: string; b: string}; };
        valueA: number[];
    };
    valueA?: number;
    valueB?: boolean;
};

export interface NestedInterface {
    nestedOptional?: {
        innerMember: string;
    };

    nested: {
        isIncluded: boolean;
    };
}

export function func(param: { nested: string }): boolean {
    return param.nested === 'yes';
}

export function createSomething() {
    return {
        foo: 'bar'
    };
}
