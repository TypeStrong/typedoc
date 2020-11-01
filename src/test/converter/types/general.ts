export type BigIntLiteral = 1n;
export type NegativeBigIntLiteral = -1n;

declare function makeValue<T>(): T;

export const BigIntLiteralType = makeValue<1n>();
export const NegativeBigIntLiteralType = makeValue<-1n>();
