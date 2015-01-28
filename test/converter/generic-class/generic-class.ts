/// <reference path="../lib.core.d.ts" />

/**
 * GenericClass short text.
 * @param T  Generic parameter.
 */
class GenericClass<T> {
    /**
     * Generic property.
     */
    private value:T;

    /**
     * Constructor short text.
     * @param value  Constructor parameter.
     */
    constructor(value:T) {
        this.value = value;
    }

    /**
     * getValue short text.
     * @return Return value comment.
     */
    getValue():T {
        return this.value;
    }
}