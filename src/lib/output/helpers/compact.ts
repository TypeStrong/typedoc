/**
 * Compress the given string by removing all newlines.
 *
 * @param text  The string that should be compressed.
 * @returns The string with all newlines stripped.
 */
export function compact(this: any, options: any): string {
    return options
        .fn(this)
        .split("\n")
        .map((line: string) => line.trim())
        .join("")
        .replace(/&nbsp;/g, " ")
        .trim();
}
