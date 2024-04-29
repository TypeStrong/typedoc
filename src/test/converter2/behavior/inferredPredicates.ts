export const isNumber = (x: unknown) => typeof x === "number";

export const isNonNullish = <T>(x: T) => x != null;
