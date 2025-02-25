import { storage } from "./utils/storage.js";

type ComponentWithLocalStorage = {
    updateLocalStorageState: (disableLocalStorage: boolean) => void;
};

class LocalStorageManager {
    private components: ComponentWithLocalStorage[] = [];

    register(component: ComponentWithLocalStorage) {
        this.components.push(component);
    }

    handleDisableLocalStorageChange(disableLocalStorage: boolean) {
        if (disableLocalStorage) {
            storage.clear();
        }
        this.components.forEach((component) =>
            component.updateLocalStorageState(disableLocalStorage),
        );
    }
}

export const localStorageManager = new LocalStorageManager();
