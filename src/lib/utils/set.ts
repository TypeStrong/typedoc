export function setIntersection<T>(a: Set<T>, b: Set<T>): Set<T> {
    const result = new Set<T>();
    for (const elem of a) {
        if (b.has(elem)) {
            result.add(elem);
        }
    }
    return result;
}
