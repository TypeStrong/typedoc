/**
 * @internal
 *
 * Use `@internal` to indicate that something is for internal use. If the
 * `--excludeInternal` option is passed, TypeDoc will not document the given
 * code.
 */
export function anInternalFunction(): void {
    // does nothing
}

/**
 * @ignore
 *
 * `@hidden` and `@ignore` keep the subsequent code from being documented.
 */
export function willNotBeDocumented(target: any, value: number): number {
    return 0;
}
