export function setIntersection<T>(a: Iterable<T>, b: Set<T>): Set<T> {
    const result = new Set<T>();
    for (const elem of a) {
        if (b.has(elem)) {
            result.add(elem);
        }
    }
    return result;
}

export function setDifference<T>(a: Iterable<T>, b: Iterable<T>): Set<T> {
    const result = new Set(a);
    for (const elem of b) {
        result.delete(elem);
    }
    return result;
}
