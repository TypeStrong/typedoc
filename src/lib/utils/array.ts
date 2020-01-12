/**
 * Inserts an item into an array sorted by priority. If two items have the same priority,
 * the item will be inserted later will be placed earlier in the array.
 * @param arr modified by inserting item.
 * @param item
 */
export function insertPrioritySorted<T extends { priority: number }>(arr: T[], item: T): T[] {
    const index = binaryFindPartition(arr, v => v.priority >= item.priority);
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
export function binaryFindPartition<T>(arr: readonly T[], partition: (item: T) => boolean): number {
    if (arr.length === 0) {
        return -1;
    }

    let low = 0, high = arr.length - 1;

    while (high > low) {
        let mid = low + Math.floor((high - low) / 2);
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
