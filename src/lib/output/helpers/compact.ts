/**
 * Compress the given string by removing all newlines.
 *
 * @param text  The string that should be compressed.
 * @returns The string with all newlines stripped.
 */
export function compact(options: any): string {
    const lines = options.fn(this).split('\n');

    for (let i = 0, c = lines.length; i < c; i++) {
        lines[i] = lines[i].trim().replace(/&nbsp;/, ' ');
    }

    return lines.join('');
}
