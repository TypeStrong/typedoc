/**
 * Base interface short text.
 *
 * Base interface text.
 */
export interface BaseInterface<T> {
    /**
     * Method with generic return type.
     *
     * @param a - Numeric parameter A.
     * @return Generic return type.
     */
    methodWithGenericReturnType(a: number): T;

    /**
     * Method with generic parameter 2.
     *
     * @param b - Generic parameter.
     */
    methodWithGenericParameter(b: T): void;

    undocumentedMethod(c: string): number;

    /**
     * Method with optional generic parameter.
     *
     * @param e - Some numeric parameter.
     * @param f - Optional generic parameter.
     */
    methodWithOptionalGenericParameter(e: number, f?: T): void;

    /**
     * Overloaded method with no args and no return value.
     */
    overloadedMethod(): void;

    /**
     * Overloaded method with numeric arg and string return value.
     *
     * @param n  The numeric argument.
     * @return The string return value.
     */
    overloadedMethod(n: number): string;

    /**
     * Overloaded method with generic arg and numeric return value.
     *
     * @param t  The generic argument.
     * @return The numeric return value.
     */
    overloadedMethod(t: T): number;

    /**
     * Overloaded method with boolean and optional generic arg and numeric return value.
     *
     * @param b  The boolean argument.
     * @param t  The optional generic argument.
     * @return The numeric return value.
     */
    overloadedMethod(b: boolean, t?: T): number;

    /**
     * Overloaded method with Date and nullable generic arg and numeric return value.
     *
     * @param d  The date argument.
     * @param t  The nullable generic argument.
     * @return The numeric return value.
     */
    overloadedMethod(d: Date, t: T | null): number;

    /**
     * Method with a union parameter and return value.
     *
     * @param a  A number or a string.
     * @return A string or a number.
     */
    unionParamMethod(a: number | string): string | number;

    /**
     * Method with one numeric parameter but implemented with an additional optional parameter.
     *
     * @param a  Numeric parameter.
     */
    extendedMethod(a: number): void;
}

/**
 * Concrete class short text.
 *
 * Concrete class text.
 */
export class ConcreteClass implements BaseInterface<string> {
    /** @inheritDoc */
    methodWithGenericReturnType(a2: number): string {
        return '' + a2;
    }

    /** @inheritDoc */
    methodWithGenericParameter(b2: string): void {}

    /**
     * No doc is copied from interface because no documentation is present there.
     *
     * @inheritDoc
     */
    undocumentedMethod(c2: string): number {
        return 0;
    }

    /** @inheritDoc */
    methodWithOptionalGenericParameter(e2: number, f2?: string): void {}

    /** @inheritDoc */
    overloadedMethod(): void;

    /** @inheritDoc */
    overloadedMethod(n2: number): string;

    /** @inheritDoc */
    overloadedMethod(t2: string): number;

    /** @inheritDoc */
    overloadedMethod(b2: boolean, t2?: string): number;

    /** @inheritDoc */
    overloadedMethod(d2: Date, t2: string | null): number;

    overloadedMethod(a?: any, b?: any): number | string {
        return 0;
    }

    /** @inheritDoc */
    unionParamMethod(a: number | string): string | number {
        return a;
    }

    /** @inheritDoc */
    extendedMethod(a2: number, b2?: string): void {
    }
}
