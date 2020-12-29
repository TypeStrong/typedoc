declare function makeValue<T>(): T;

export type BigIntLiteral = 1n;
export const BigIntLiteralType = makeValue<1n>();

export type NegativeBigIntLiteral = -1n;
export const NegativeBigIntLiteralType = makeValue<-1n>();

export type NumArray = number[];
export const numArray = makeValue<number[]>();

export type BigIntAlias = bigint;

export type NegativeOne = -1;
export const negativeOne = -1;
