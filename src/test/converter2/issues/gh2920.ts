type EndpointIdentifier = "main" | "test";

/**
 * @inlineType EndpointIdentifier
 */
export function test(endpoint: EndpointIdentifier) {}

type InlinedConditional<T> = T extends string ? 1 : 2;

/** @inlineType InlinedConditional */
export type NotInlined = InlinedConditional<string>;

/** @inline */
type StrArr = string[];

export type InlineArray = StrArr;
