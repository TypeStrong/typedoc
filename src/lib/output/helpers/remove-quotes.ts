/**
 * Removes any double-quotes from the input string
 *
 * @param str  The string that should be updated.
 * @return     The original string, omitting double quotes (`"`).
 */
export function removeQuotes(options: any): string {
    let str = typeof options === 'string' ? options : options.fn(this);
    str = str.replace(/"/g, '');
    return str;
}
