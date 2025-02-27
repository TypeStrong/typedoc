// This exists to abstract away the horrible fact that accessing localStorage can throw
// an exception depending on a user's browser settings. Can't even check typeof localStorage
// so we're stuck with a try..catch.

export interface MinimalStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}

let _storage: MinimalStorage;

const localStorageImpl: MinimalStorage = localStorage;

const noOpStorageImpl: MinimalStorage = {
    getItem() {
        return null;
    },
    setItem() {},
    removeItem() {},
    clear() {},
};

try {
    _storage = localStorageImpl;
} catch {
    _storage = noOpStorageImpl;
}

export const storage = {
    getItem: (key: string) => _storage.getItem(key),
    setItem: (key: string, value: string) => _storage.setItem(key, value),
    removeItem: (key: string) => _storage.removeItem(key),
    clear: () => _storage.clear(),
    disable() {
        localStorage.clear();
        _storage = noOpStorageImpl;
        console.log(_storage);
    },
    enable() {
        _storage = localStorageImpl;
        console.log(_storage);
    },
};
