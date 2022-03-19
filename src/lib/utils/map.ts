export class DefaultMap<K, V> extends Map<K, V> {
    constructor(private creator: () => V) {
        super();
    }

    override get(key: K): V {
        const saved = super.get(key);
        if (saved != null) {
            return saved;
        }

        const created = this.creator();
        this.set(key, created);
        return created;
    }
}
