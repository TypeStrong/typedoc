import * as Handlebars from 'handlebars';

/**
 * Insert word break tags ``<wbr>`` into the given string.
 *
 * Breaks the given string at ``_``, ``-`` and capital letters.
 *
 * @param str The string that should be split.
 * @return The original string containing ``<wbr>`` tags where possible.
 */
export function wbr(options: any): Handlebars.SafeString {
    let str = typeof options === 'string' ? options : options.fn(this);
    str = Handlebars.escapeExpression(str);

    str = str.replace(/([^_\-][_\-])([^_\-])/g, (m: string, a: string, b: string) => a + '<wbr>' + b);
    str = str.replace(/([^A-Z])([A-Z][^A-Z])/g, (m: string, a: string, b: string) => a + '<wbr>' + b);

    return new Handlebars.SafeString(str);
}
