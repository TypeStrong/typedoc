export const emptyArray: readonly [] = [];

/**
 * Inserts an item into an array sorted by priority. If two items have the same priority,
 * the item will be inserted later will be placed later in the array.
 * Higher priority is placed earlier in the array.
 * @param arr modified by inserting item.
 * @param item
 */
export function insertPrioritySorted<T extends { priority: number }>(
    arr: T[],
    item: T,
): T[] {
    const index = binaryFindPartition(arr, (v) => v.priority < item.priority);
    arr.splice(index === -1 ? arr.length : index, 0, item);
    return arr;
}

/**
 * Inserts an item into an array sorted by order. If two items have the same order,
 * the item inserted later will be placed later in the array.
 * The array will be sorted with lower order being placed sooner.
 * @param arr modified by inserting item.
 * @param item
 */
export function insertOrderSorted<T extends { order: number }>(
    arr: T[],
    item: T,
): T[] {
    const index = binaryFindPartition(arr, (v) => v.order > item.order);
    arr.splice(index === -1 ? arr.length : index, 0, item);
    return arr;
}

/**
 * Performs a binary search of a given array, returning the index of the first item
 * for which `partition` returns true. Returns the -1 if there are no items in `arr`
 * such that `partition(item)` is true.
 * @param arr
 * @param partition should return true while less than the partition point.
 */
export function binaryFindPartition<T>(
    arr: readonly T[],
    partition: (item: T) => boolean,
): number {
    if (arr.length === 0) {
        return -1;
    }

    let low = 0,
        high = arr.length - 1;

    while (high > low) {
        const mid = low + Math.floor((high - low) / 2);
        if (partition(arr[mid])) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    return partition(arr[low]) ? low : -1;
}

/**
 * Removes an item from the array if the array exists and the item is included
 * within it.
 * @param arr
 * @param item
 */
export function removeIfPresent<T>(arr: T[] | undefined, item: T) {
    if (!arr) {
        return;
    }
    const index = arr.indexOf(item);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}

/**
 * Remove items in an array which match a predicate.
 * @param arr
 * @param predicate
 */
export function removeIf<T>(arr: T[], predicate: (item: T) => boolean) {
    for (let i = 0; i < arr.length; i++) {
        if (predicate(arr[i])) {
            arr.splice(i, 1);
            i--;
        }
    }
}

/**
 * Filters out duplicate values from the given iterable.
 * @param arr
 */
export function unique<T>(arr: Iterable<T> | undefined): T[] {
    return Array.from(new Set(arr));
}

export function partition<T>(
    iter: Iterable<T>,
    predicate: (item: T) => boolean,
): [T[], T[]] {
    const left: T[] = [];
    const right: T[] = [];

    for (const item of iter) {
        if (predicate(item)) {
            left.push(item);
        } else {
            right.push(item);
        }
    }

    return [left, right];
}

export function* zip<T extends Iterable<any>[]>(
    ...args: T
): Iterable<{ [K in keyof T]: T[K] extends Iterable<infer U> ? U : T[K] }> {
    const iterators = args.map((x) => x[Symbol.iterator]());

    for (;;) {
        const next = iterators.map((i) => i.next());
        if (next.some((v) => v.done)) {
            break;
        }
        yield next.map((v) => v.value) as any;
    }
}

export function filterMap<T, U>(
    iter: Iterable<T> | undefined,
    fn: (item: T) => U | undefined,
): U[] {
    const result: U[] = [];

    for (const item of iter || []) {
        const newItem = fn(item);
        if (newItem !== void 0) {
            result.push(newItem);
        }
    }

    return result;
}

export function firstDefined<T, U>(
    array: readonly T[],
    callback: (element: T, index: number) => U | undefined,
): U | undefined {
    for (let i = 0; i < array.length; i++) {
        const result = callback(array[i], i);
        if (result !== undefined) {
            return result;
        }
    }
    return undefined;
}

export function filter<T>(
    array: readonly T[] | undefined,
    predicate: (value: T, index: number, array: readonly T[]) => boolean,
): readonly T[] {
    return array ? array.filter(predicate) : emptyArray;
}

export function aggregate<T>(arr: T[], fn: (item: T) => number) {
    return arr.reduce((sum, it) => sum + fn(it), 0);
}

export function joinArray<T>(
    arr: readonly T[] | undefined,
    joiner: string,
    mapper: (item: T) => string,
): string {
    if (arr?.length) {
        return arr.map(mapper).join(joiner);
    }
    return "";
}

export function maxElementByScore<T>(
    arr: readonly T[],
    score: (a: T) => number,
): T | undefined {
    if (arr.length === 0) {
        return undefined;
    }

    let largest = arr[0];
    let largestScore = score(arr[0]);

    for (let i = 1; i < arr.length; ++i) {
        const itemScore = score(arr[i]);
        if (itemScore > largestScore) {
            largest = arr[i];
            largestScore = itemScore;
        }
    }

    return largest;
}
