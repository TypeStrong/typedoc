/**
 * @param a - Number param.
 */
export function hidden(a: number): void;

/**
 * @param a - String param.
 */
export function hidden(a: string): void;

/** @hidden */
export function hidden(a: string | number): void {
    console.log(a);
}

/** @hidden */
export function implicitlyHidden(x: string): void;
/** @hidden */
export function implicitlyHidden(x: number): void;
export function implicitlyHidden() {}

/** @hidden */
export const hiddenVariableFunc = () => 1;
