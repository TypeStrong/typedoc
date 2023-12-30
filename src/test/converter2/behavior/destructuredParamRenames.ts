/**
 * This is a function with a destructured parameter.
 *
 * @param destructuredParam - This is the parameter that is destructured.
 * @param destructuredParam.paramZ - This is a string parameter.
 * @param destructuredParam.paramG - This is a parameter flagged with any.
 *     This sentence is placed in the next line.
 *
 * @param destructuredParam.paramA
 *   This is a **parameter** pointing to an interface.
 *
 *   ```
 *   const value:BaseClass = new BaseClass('test');
 *   functionWithArguments('arg', 0, value);
 *   ```
 *
 * @returns This is the return value of the function.
 */
export function functionWithADestructuredParameter({
    paramZ,
    paramG,
    paramA,
}: {
    paramZ: string;
    paramG: any;
    paramA: Object;
}): number {
    return 0;
}

/**
 * This is a function with a destructured parameter and additional undocumented parameters.
 * The `@param` directives are ignored because we cannot be certain which parameter they refer to.
 *
 * @param destructuredParam - This is the parameter that is destructured.
 * @param destructuredParam.paramZ - This is a string parameter.
 * @param destructuredParam.paramG - This is a parameter flagged with any.
 *     This sentence is placed in the next line.
 *
 * @param destructuredParam.paramA
 *   This is a **parameter** pointing to an interface.
 *
 *   ```
 *   const value:BaseClass = new BaseClass('test');
 *   functionWithArguments('arg', 0, value);
 *   ```
 *
 * @returns This is the return value of the function.
 */
export function functionWithADestructuredParameterAndExtraParameters(
    {
        paramZ,
        paramG,
        paramA,
    }: {
        paramZ: string;
        paramG: any;
        paramA: Object;
    },
    extraParameter: string,
): number {
    return 0;
}

/**
 * This is a function with a destructured parameter and an extra `@param` directive with no corresponding parameter.
 * The `@param` directives are ignored because we cannot be certain which corresponds to the real parameter.
 *
 * @param fakeParameter - This directive does not have a corresponding parameter.
 * @param destructuredParam - This is the parameter that is destructured.
 * @param destructuredParam.paramZ - This is a string parameter.
 * @param destructuredParam.paramG - This is a parameter flagged with any.
 *     This sentence is placed in the next line.
 *
 * @param destructuredParam.paramA
 *   This is a **parameter** pointing to an interface.
 *
 *   ```
 *   const value:BaseClass = new BaseClass('test');
 *   functionWithArguments('arg', 0, value);
 *   ```
 *
 * @returns This is the return value of the function.
 */
export function functionWithADestructuredParameterAndAnExtraParamDirective({
    paramZ,
    paramG,
    paramA,
}: {
    paramZ: string;
    paramG: any;
    paramA: Object;
}): number {
    return 0;
}
