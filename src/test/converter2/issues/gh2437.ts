export interface TemplatedTypeBase {
    /**
     * Doc here
     */
    prop?: string[];
}

export interface One extends TemplatedTypeBase {}

export interface Two extends TemplatedTypeBase {}

export type Type = One | Two;

export function isTemplateInstance(
    type: Type,
): type is Type & { prop: string[] } {
    return true;
}
