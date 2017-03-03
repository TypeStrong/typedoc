/**
 * Insert word break tags ``<wbr>`` into the given string.
 *
 * Breaks the given string at ``_``, ``-`` and captial letters.
 *
 * @param str  The string that should be split.
 * @return     The original string containing ``<wbr>`` tags where possible.
 */
export function wbr(options: any): string {
    let str = typeof options === 'string' ? options : options.fn(this);

    str = str.replace(/([^_\-][_\-])([^_\-])/g, (m: string, a: string, b: string) => a + '<wbr>' + b);
    str = str.replace(/([^A-Z])([A-Z][^A-Z])/g, (m: string, a: string, b: string) => a + '<wbr>' + b);

    return str;
}
