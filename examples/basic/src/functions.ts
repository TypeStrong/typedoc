import classes = require('classes');

/**
 * This is an internal function.
 */
function internalFunction():void { }


/**
 * This is a simple exported function.
 */
export function exportedFunction():void { }


/**
 * This is a function with multiple arguments and a return value.
 * @param paramA  This is a string parameter.
 * @param paramB  This is a parameter flagged with any.
 *     This sentence is placed in the next line.
 *
 * @param paramC
 * This is a **parameter** pointing to an interface.
 *
 * ~~~
 * var value:BaseClass = new BaseClass('test');
 * functionWithArguments('arg', 0, value);
 * ~~~
 *
 */
export function functionWithArguments(paramA:string, paramB:any, paramC:classes.INameInterface):number {
    return 0;
}


/**
 * This is a function with a parameter that is optional.
 *
 * @param requiredParam  A normal parameter.
 * @param optionalParam  An optional parameter.
 */
export function functionWithOptionalValue(requiredParam:string, optionalParam?:string) { }


/**
 * This is a function with a parameter that has a default value.
 *
 * @param value  An optional return value.
 * @returns The input value or the default value.
 */
export function functionWithDefaults(value:string = 'defaultValue'):string {
    return value;
}


/**
 * This is the first signature of a function with multiple signatures.
 *
 * @param value  The name value.
 */
export function multipleSignatures(value:string):string;

/**
 * This is the second signature a function with multiple signatures.
 *
 * @param value  An object containing the name value.
 */
export function multipleSignatures(value:{name:string}):string;

/**
 * This is the actual implementation, this comment will not be visible
 * in the generated documentation.
 */
export function multipleSignatures():string {
    if (arguments.length > 0) {
        if (typeof arguments[0] == 'object') {
            return arguments[0].name;
        } else {
            return arguments[0];
        }
    }

    return '';
}


/**
 * This is a generic function.
 */
export function genericFunction<T>(value:T):T {
    return value;
}


/**
 * This is a function that is extended by a module.
 */
export function moduleFunction() { }


/**
 * This is the module extending the function moduleFunction().
 */
export module moduleFunction
{
    /**
     * This variable is appended to a function.
     */
    var functionVariable:string;


    /**
     * This function is appended to another function.
     */
    function append() {

    }

    /**
     * This function is appended to another function.
     */
    function prepend() {

    }
}
