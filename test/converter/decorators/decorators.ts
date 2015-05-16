/// <reference path="../lib.core.d.ts" />


/**
 * A decorated class.
 */
@decoratorWithOptions({
    name: 'Name of class'
})
class DecoratedClass
{
    /**
     * A decorated method.
     */
    @decoratorAtom
    @decoratorWithParam(false)
    decoratedMethod() { }
}


/**
 * A decorator with no options.
 */
function decoratorAtom(target, key, descriptor) {
    descriptor.writable = false;
}


/**
 * A decorator with a parameter.
 *
 * @param value  The parameter of this decorator.
 */
function decoratorWithParam(value:boolean) {
    return function (target, key, descriptor) {
        descriptor.enumerable = value;
    }
}


/**
 * A decorator consuming an options object.
 *
 * @param options  The options object of this decorator.
 * @param options.name  A property on the options object of this decorator.
 */
function decoratorWithOptions(options:{name:string}) {
    return function (target, key, descriptor) {
        descriptor.options = options;
    }
}