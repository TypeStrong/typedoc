/**
 * Summary
 * @remarks Remarks
 * @typeParam T - Type parameter
 */
export interface InterfaceSource<T> {
    /**
     * Property description
     */
    property: T;

    /**
     * Method description
     * @param arg arg description
     */
    someMethod(arg: number): T;
}

/**
 * @inheritDoc InterfaceSource
 */
export interface InterfaceTarget<T> {
    /**
     * @inheritDoc InterfaceSource.property
     */
    property: T;

    /**
     * @inheritDoc InterfaceSource.someMethod
     *
     * @example This should still be present
     * ```ts
     * someMethod(123)
     * ```
     */
    someMethod(arg: number): T;
}
