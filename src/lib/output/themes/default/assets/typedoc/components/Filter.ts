import { Component, IComponentOptions } from "../Component";

/**
 * Handles sidebar filtering functionality.
 */
export class Filter extends Component {

    override el!: HTMLInputElement;

    /**
     * Whether localStorage is available for use.
     */
    private readonly useLocalStorage = typeof window.localStorage !== "undefined";

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
        })
        if (this.useLocalStorage) {
            this.setLocalStorage(this.fromLocalStorage() || this.value, true);
        }
    }

    /**
     * Retrieve value from localStorage.
     */
    private fromLocalStorage(): boolean {
        return window.localStorage[this.key] === "true";
    }

    /**
     * Set value to local storage.
     *
     * @param value  Value to set.
     * @param force  Whether to trigger value change even if the value is identical to the previous state.
     */
    private setLocalStorage(value: boolean, force: boolean = false): void {
        if (this.value === value && !force) return;
        if (this.useLocalStorage) {
            window.localStorage[this.key] = value ? "true" : "false";
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
    }
}
