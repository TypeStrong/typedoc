/**
 * @param {string} x the string to parse as a number
 * @param {boolean} [int=true] whether to parse as an integer or float
 */
export function toNumber(x, int = true) {
    return int ? parseInt(x) : parseFloat(x);
}
