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
 * A type alias of for a generic callback function.
 *
 * @param GenericCallback.T      Some type argument.
 * @param GenericCallback.val    Some generic value.
 * @param GenericCallback.index  Some index value.
 * @param GenericCallback.arr    A generic array.
 * @return       Some return value.
 */
export type GenericCallback = <T>(val: T, index: number, arr: Array<T>) => any;


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


/**
 * A generic function using a generic type alias.
 *
 * @param T         Some type argument.
 * @param arr       A generic array.
 * @param callback  Some generic type alias callback.
 * @returns         Some return value.
 */
function functionWithGenericCallback<T>(arr: Array<T>, callback: GenericCallback): any {
    return 0;
}

/**
 * A simple text class.
 */
class SimpleClass
{
    /**
     * A generic function using a generic type alias.
     *
     * Uses [[GenericCallback]] instead of [[Callback]].
     *
     * @param T         Some type argument.
     * @param arr       A generic array.
     * @param callback  Some generic type alias callback.
     * @returns         Some return value.
     */
    public someFunction<T>(arr: Array<T>, callback: GenericCallback): any {
        return 0;
    }
}