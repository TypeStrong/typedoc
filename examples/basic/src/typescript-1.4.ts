/**
 * Examples of features added in TypeScript 1.4.
 *
 * @see  http://blogs.msdn.com/b/typescript/archive/2014/11/18/what-s-new-in-the-typescript-type-system.aspx
 */

/**
 * A simple interface holding a member with an union type.
 */
interface RunOptions {
    program: string;
    commandline: string[]|string;
}


/**
 * A type alias describing an array.
 */
type PrimitiveArray = Array<string|number|boolean>;


/**
 * A type alias describing a primitive value.
 */
type MyNumber = number;


/**
 * A type alias describing a reference type.
 */
type MyRunOptions = RunOptions;


/**
 * A type alias of for a callback function.
 *
 * @param Callback.parameters  The rest parameter.
 */
type Callback = (...parameters:string[]) => string;


/**
 * A variable defined using an union type.
 */
var interfaceOrString:RunOptions|string;


/**
 * A variable pointing to a type alias.
 */
var callback:Callback;


/**
 * A function that has parameters pointing to type aliases and returns a type alias.
 */
function functionUsingTypes(aliasData:PrimitiveArray, callback:Callback):MyNumber {
    return 10;
}