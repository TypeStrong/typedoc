/**
 * Compress the given string by removing all newlines.
 *
 * @param text  The string that should be compressed.
 * @returns The string with all newlines stripped.
 */
export function compact(options: any): string {
    return options.fn(this)
        .split('\n')
        .map(line => line.trim())
        .join('')
        .replace(/&nbsp;/g, ' ')
        .trim();
}
