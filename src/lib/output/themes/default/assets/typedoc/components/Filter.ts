import { Component, IComponentOptions } from "../Component.js";
import { storage } from "../utils/storage.js";
import { localStorageManager } from "../LocalStorageManager.js";

const style = document.head.appendChild(document.createElement("style"));
style.dataset.for = "filters";

/**
 * Handles sidebar filtering functionality.
 */
export class Filter extends Component<HTMLInputElement> {
    /**
     * The class name & ID by which to store the filter value.
     */
    private readonly key: string;

    /**
     * Current filter value, to keep in sync with checkbox state.
     */
    private value: boolean;

    /**
     * Whether to disable local storage for this filter.
     */
    private disableLocalStorage: boolean;

    constructor(
        options: IComponentOptions & { disableLocalStorage?: boolean },
    ) {
        super(options);
        this.key = `filter-${this.el.name}`;
        this.value = this.el.checked;
        this.disableLocalStorage =
            document.documentElement.dataset.disableLocalStorage === "true";

        this.el.addEventListener("change", () => {
            this.setLocalStorage(this.el.checked);
        });
        this.setLocalStorage(this.fromLocalStorage());

        style.innerHTML += `html:not(.${this.key}) .tsd-is-${this.el.name} { display: none; }\n`;
        this.app.updateIndexVisibility();

        localStorageManager.register(this);
    }

    /**
     * Retrieve value from storage.
     * Note: Shortcuts to return the value if local storage is disabled.
     */
    private fromLocalStorage(): boolean {
        if (this.disableLocalStorage) {
            return this.el.checked;
        }
        const fromStorage = storage.getItem(this.key);
        return fromStorage ? fromStorage === "true" : this.el.checked;
    }

    /**
     * Set value to local storage.
     * Note: Skip storing value if local storage is disabled.
     * @param value  Value to set.
     */
    private setLocalStorage(value: boolean): void {
        if (!this.disableLocalStorage) {
            storage.setItem(this.key, value.toString());
        }
        this.value = value;
        this.handleValueChange();
    }

    /**
     * Synchronize DOM based on value change.
     */
    private handleValueChange(): void {
        this.el.checked = this.value;
        document.documentElement.classList.toggle(this.key, this.value);

        this.app.filterChanged();
        this.app.updateIndexVisibility();
    }

    /**
     * Update the local storage state for this component.
     * @param disableLocalStorage
     */
    updateLocalStorageState(disableLocalStorage: boolean) {
        this.disableLocalStorage = disableLocalStorage;
        if (disableLocalStorage) {
            storage.removeItem(this.key);
        }
    }
}
