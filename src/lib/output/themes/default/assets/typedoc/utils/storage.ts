// This exists to abstract away the horrible fact that accessing localStorage can throw
// an exception depending on a user's browser settings. Can't even check typeof localStorage
// so we're stuck with a try..catch.

export interface MinimalStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

let _storage: MinimalStorage;

const noOpStorageImpl: MinimalStorage = {
    getItem() {
        return null;
    },
    setItem() {},
};

let localStorageImpl: MinimalStorage;

try {
    localStorageImpl = localStorage;
    _storage = localStorageImpl;
} catch {
    localStorageImpl = noOpStorageImpl;
    _storage = noOpStorageImpl;
}

export const storage = {
    getItem: (key: string) => _storage.getItem(key),
    setItem: (key: string, value: string) => _storage.setItem(key, value),
    disable(clearStorage: boolean =  false) {
        if (clearStorage) { removeTypeDocStorage();}
        _storage = noOpStorageImpl;
    },
    enable() {
        _storage = localStorageImpl;
    },
};

function removeTypeDocStorage() {
    const keysToRemove = [
        "filter-protected",
        "filter-inherited",
        "filter-external",
        "tsd-theme",
    ];
    const regex = /^tsd-accordion-/;

    try {
        const keys: string[] = [];

        Object.keys(localStorage).forEach(key => {
            if (keysToRemove.includes(key) || regex.test(key)) {
                localStorage.removeItem(key);
            }
        });
    } catch {
        // Silently ignore any errors
    }
}