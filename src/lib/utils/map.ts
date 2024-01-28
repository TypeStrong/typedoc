export class DefaultMap<K, V> extends Map<K, V> {
    constructor(private creator: (key: K) => V) {
        super();
    }

    override get(key: K): V {
        const saved = super.get(key);
        if (saved != null) {
            return saved;
        }

        const created = this.creator(key);
        this.set(key, created);
        return created;
    }

    getNoInsert(key: K): V | undefined {
        return super.get(key);
    }
}

export class StableKeyMap<K extends { getStableKey(): string }, V>
    implements Map<K, V>
{
    [Symbol.toStringTag] = "StableKeyMap";
    private impl = new Map<string, [K, V]>();

    get size(): number {
        return this.impl.size;
    }

    set(key: K, value: V) {
        this.impl.set(key.getStableKey(), [key, value]);
        return this;
    }

    get(key: K): V | undefined {
        return this.impl.get(key.getStableKey())?.[1];
    }

    has(key: K): boolean {
        return this.get(key) != null;
    }

    clear(): void {
        this.impl.clear();
    }

    delete(key: K): boolean {
        return this.impl.delete(key.getStableKey());
    }

    forEach(
        callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        thisArg?: any,
    ): void {
        for (const [k, v] of this.entries()) {
            callbackfn.apply(thisArg, [v, k, this]);
        }
    }

    entries(): IterableIterator<[K, V]> {
        return this.impl.values();
    }

    *keys(): IterableIterator<K> {
        for (const [k] of this.entries()) {
            yield k;
        }
    }

    *values(): IterableIterator<V> {
        for (const [, v] of this.entries()) {
            yield v;
        }
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }
}
