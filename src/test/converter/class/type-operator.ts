/**
 * TestClass comment short text.
 *
 * TestClass comment text.
 *
 * @see {@link TestClass} @ fixtures
 */
export class TestClass {
    a: string;
    b: number;
}

export class GenericClass<T extends keyof TestClass> {
    c: T;
}
