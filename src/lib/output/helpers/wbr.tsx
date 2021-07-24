import * as React from 'react';

/**
 * Insert word break tags ``<wbr>`` into the given string.
 *
 * Breaks the given string at ``_``, ``-`` and capital letters.
 *
 * @param str The string that should be split.
 * @return The original string containing ``<wbr>`` tags where possible.
 */
export function wbr(str: string): (string | Element)[] {
    // TODO surely there is a better way to do this, but I'm tired.
    const ret: (string | Element)[] = [];
    const re = /^[\s\S]*?(?:([^_-][_-])(?=[^_-])|([^A-Z])(?=[A-Z][^A-Z]))/g;
    let match: RegExpExecArray | null;
    let i = 0;
    while((match = re.exec(str))) {
        ret.push(match[0]);
        ret.push(<wbr />);
        i += match.index + match[0].length;
    }
    ret.push(str.slice(i));

    return ret;
}
