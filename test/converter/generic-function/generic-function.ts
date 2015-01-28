/// <reference path="../lib.core.d.ts" />

/**
 * Generic function short text.
 * @param T      Generic function type parameter.
 * @param value  Generic function parameter.
 * @returns      Generic function return value.
 */
function genericFunction<T extends Object>(value:T):T {
    return value;
}