/**
 * Parses a JSON string to the specified type.
 */
export function safeParse<T>(
    guard: (o: unknown) => o is T,
    json: string,
): T | undefined {
    try {
        const o = JSON.parse(json) as unknown;
        return guard(o) ? o : undefined;
    } catch {
        return undefined;
    }
}
