// This exists to abstract away the horrible fact that accessing localStorage can throw
// an exception depending on a user's browser settings. Can't even check typeof localStorage
// so we're stuck with a try..catch.

export interface MinimalStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

let _storage: MinimalStorage;

try {
    _storage = localStorage;
} catch {
    _storage = {
        getItem() {
            return null;
        },
        setItem() {},
    };
}

export const storage = _storage;
