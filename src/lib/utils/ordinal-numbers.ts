/**
 * Format an integer value as an ordinal string. Throwing if the value is not a
 * positive integer
 * @param value The integer value to format as its ordinal version
 */
export function toOrdinal(value: number): string {
    if (!Number.isInteger(value)) {
        throw new TypeError("value must be an integer number");
    }

    if (value < 0) {
        throw new TypeError("value must be a positive integer");
    }

    const onesDigit = value % 10;
    const tensDigit = ((value % 100) - onesDigit) / 10;

    if (tensDigit === 1) {
        return `${value}th`;
    }

    const ordinal = onesDigit === 1 ? "st" : onesDigit === 2 ? "nd" : "th";

    return `${value}${ordinal}`;
}
