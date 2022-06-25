/**
 * Source
 * @remarks Remarks
 */
export const source = 123;

export const source2 = 123;

/**
 * Target summary
 * @inheritDoc source
 */
export const target1 = 123;

/**
 * @inheritDoc source
 * @remarks Target remarks
 */
export const target2 = 123;

/**
 * @inheritDoc doesNotExist
 */
export const target3 = 123;

/**
 * @inheritDoc source2
 */
export const target4 = 123;

/**
 * {@inheritDoc source:bad_label}
 */
export const badParse = 456;
