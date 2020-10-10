import * as Handlebars from "handlebars";

/**
 * Insert word break tags ``<wbr>`` into the given string.
 *
 * Breaks the given string at ``_``, ``-`` and capital letters.
 *
 * @param str The string that should be split.
 * @return The original string containing ``<wbr>`` tags where possible.
 */
export function wbr(this: any, options: any): Handlebars.SafeString {
    let str: string = typeof options === "string" ? options : options.fn(this);
    str = Handlebars.escapeExpression(str);

    str = str.replace(/&#x3D;/g, "&#61;"); // because 3D would be converted to 3<wbr>D, use decimal format instead

    str = str.replace(/([^_-][_-])([^_-])/g, (_m, a, b) => a + "<wbr>" + b);
    str = str.replace(/([^A-Z])([A-Z][^A-Z])/g, (_m, a, b) => a + "<wbr>" + b);

    return new Handlebars.SafeString(str);
}
