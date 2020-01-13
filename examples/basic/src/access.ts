/**
 * A variable that is made private via comment.
 * @private
 */
// tslint:disable-next-line:no-var-keyword
export var fakePrivateVariable = 'test';

/**
 * A variable that is made protected via comment.
 * @protected
 */
export let fakeProtectedVariable = 'test';

/**
 * A function that is made private via comment.
 * @private
 */
export function fakePrivateFunction() {}

/**
 * A function that is made protected via comment.
 * @protected
 */
export function fakeProtectedFunction() {}

/**
 * A class that is documented as being private.
 * @private
 */
export class PrivateClass {
    /**
     * A variable that is made private via comment.
     * @private
     */
    fakePrivateVariable: string;

    /**
     * A variable that is made protected via comment.
     * @protected
     */
    fakeProtectedVariable: string;

    /**
     * A function that is made private via comment.
     * @private
     */
    fakePrivateFunction() {}

    /**
     * A function that is made protected via comment.
     * @protected
     */
    fakeProtectedFunction() {}
}

/**
 * A module that is documented as being private.
 * @private
 */
export module PrivateModule {
    export function functionInsidePrivateModule() {}
}
