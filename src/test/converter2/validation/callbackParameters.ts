/**
 * Test case from https://github.com/TypeStrong/typedoc/issues/2154
 * @param data The data object to add equality to
 * @param equals The equality function
 * @param hashCode The hash code function
 */
export function gh2154(
    data: unknown,
    equals: (a: 1, b: 2) => boolean,
    hashCode: (data: 3) => number,
) {}

export class AnotherTest {
    /**
     * Property is documented
     * @param a test
     * @param b another
     */
    equals!: (a: 1, b: 2) => boolean;
}
