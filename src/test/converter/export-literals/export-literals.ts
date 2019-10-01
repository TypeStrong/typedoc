export interface INestedInterface
{
    nestedOptional?: {
        innerMember: string;
    };

    nested: {
        isIncluded: boolean;
    };
}

export function func(param: {nested: string}): boolean {
    return param.nested === 'yes';
}

export function createSomething() {
    return {
        foo: 'bar'
    };
}
