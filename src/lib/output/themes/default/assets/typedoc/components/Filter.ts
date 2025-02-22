import { Component, IComponentOptions } from "../Component.js";
import { storage } from "../utils/storage.js";

const style = document.head.appendChild(document.createElement("style"));
style.dataset.for = "filters";

/** Filter classes, true if they will currently show, false otherwise */
const filters: Record<string, boolean> = {};

export function classListWillBeFiltered(classList: string): boolean {
    for (const className of classList.split(/\s+/)) {
        // There might be other classes in the list besides just what we filter on
        if (filters.hasOwnProperty(className) && !filters[className]) {
            return true;
        }
    }
    return false;
}

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

    constructor(options: IComponentOptions) {
        super(options);
        this.key = `filter-${this.el.name}`;
        this.value = this.el.checked;
        this.el.addEventListener("change", () => {
            this.setLocalStorage(this.el.checked);
        });
        this.setLocalStorage(this.fromLocalStorage());

        style.innerHTML += `html:not(.${this.key}) .tsd-is-${this.el.name} { display: none; }\n`;
        this.app.updateIndexVisibility();
    }

    /**
     * Retrieve value from storage.
     */
    private fromLocalStorage(): boolean {
        const fromStorage = storage.getItem(this.key);
        return fromStorage ? fromStorage === "true" : this.el.checked;
    }

    /**
     * Set value to local storage.
     *
     * @param value  Value to set.
     */
    private setLocalStorage(value: boolean): void {
        storage.setItem(this.key, value.toString());
        this.value = value;
        this.handleValueChange();
    }

    /**
     * Synchronize DOM based on value change.
     */
    private handleValueChange(): void {
        this.el.checked = this.value;
        document.documentElement.classList.toggle(this.key, this.value);

        filters[`tsd-is-${this.el.name}`] = this.value;

        this.app.filterChanged();
        this.app.updateIndexVisibility();
    }
}
