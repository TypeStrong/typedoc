// A future TS version might change this so that numbers are hardcoded
// to show up in a specific order. As of TS 5.3.3, this makes the union display
// as 3 | 1 | 2.
type WeirdOrder = [1, 2, 3][number];
//   ^?

export const Test = null! as WeirdOrder;
