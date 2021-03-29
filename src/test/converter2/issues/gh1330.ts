export type ExampleParam = Example;
export interface Example<T extends ExampleParam = ExampleParam> {}

declare const makeExample: () => Example;
declare const makeExample2: () => ExampleParam;

// Recursive type when we don't have a type node.
export const testValue = makeExample();
export const testValue2 = makeExample2();

export type HasProp<T> = { key: T };

declare const makeProp: <T>(x: T) => HasProp<T>;
export const testValue3 = makeProp(1);
