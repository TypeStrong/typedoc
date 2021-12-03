import { Component, IComponentOptions } from "../Component";
import { pointerDown, pointerUp } from "../utils/pointer";

abstract class FilterItem<T> {
    protected key: string;

    protected value: T;

    protected defaultValue: T;

    constructor(key: string) {
        this.key = key;
        this.value;
        this.defaultValue;

        this.initialize();

        if (window.localStorage[this.key]) {
            this.setValue(this.fromLocalStorage(window.localStorage[this.key]));
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected initialize() {}

    protected abstract handleValueChange(oldValue: T, newValue: T): void;

    protected abstract fromLocalStorage(value: string): T;

    protected abstract toLocalStorage(value: T): string;

    protected setValue(value: T) {
        if (this.value == value) return;

        const oldValue = this.value;
        this.value = value;
        window.localStorage[this.key] = this.toLocalStorage(value);

        this.handleValueChange(oldValue, value);
    }
}

class FilterItemCheckbox extends FilterItem<boolean> {
    private checkbox!: HTMLInputElement;

    protected override initialize() {
        const checkbox = document.querySelector<HTMLInputElement>(
            "#tsd-filter-" + this.key
        );
        if (!checkbox) return;

        this.checkbox = checkbox;
        this.value = !!checkbox.checked;
        this.defaultValue = this.value;
        this.checkbox.addEventListener("change", () => {
            this.setValue(this.checkbox.checked);
        });
    }

    protected handleValueChange(_oldValue: boolean, _newValue: boolean) {
        if (!this.checkbox) return;
        this.checkbox.checked = this.value;
        document.documentElement.classList.toggle(
            "toggle-" + this.key,
            this.value != this.defaultValue
        );
    }

    protected fromLocalStorage(value: string): boolean {
        return value == "true";
    }

    protected toLocalStorage(value: boolean): string {
        return value ? "true" : "false";
    }
}

class FilterItemSelect extends FilterItem<string> {
    private select!: HTMLElement;

    protected override initialize() {
        const select = document.querySelector<HTMLElement>(
            "#tsd-filter-" + this.key
        );
        if (!select) return;

        const selectedEl = select.querySelector("li.selected");
        this.select = select;
        this.value = selectedEl.getAttribute("data-value");
        this.defaultValue = this.value;
        document.documentElement.classList.add(
            "toggle-" + this.key + this.value
        );
        const onActivate = () => {
            this.select.classList.add("active");
        };
        const onDeactivate = () => {
            this.select.classList.remove("active");
        };

        this.select.addEventListener(pointerDown, onActivate);
        this.select.addEventListener("mouseover", onActivate);
        this.select.addEventListener("mouseleave", onDeactivate);

        this.select.querySelectorAll("li").forEach((el) => {
            el.addEventListener(pointerUp, (e) => {
                select.classList.remove("active");
                this.setValue((e.target as HTMLElement).dataset["value"] || "");
            });
        });

        document.addEventListener(pointerDown, (e) => {
            if (this.select.contains(e.target as HTMLElement)) return;

            this.select.classList.remove("active");
        });
    }

    protected handleValueChange(oldValue: string, newValue: string) {
        this.select.querySelectorAll("li.selected").forEach((el) => {
            el.classList.remove("selected");
        });

        const selected = this.select.querySelector<HTMLElement>(
            'li[data-value="' + newValue + '"]'
        );
        const label =
            this.select.querySelector<HTMLElement>(".tsd-select-label");

        if (selected && label) {
            selected.classList.add("selected");
            label.textContent = selected.textContent;
        }

        document.documentElement.classList.remove("toggle-" + oldValue);
        document.documentElement.classList.add("toggle-" + newValue);
    }

    protected fromLocalStorage(value: string): string {
        return value;
    }

    protected toLocalStorage(value: string): string {
        return value;
    }
}

export class Filter extends Component {
    public readonly optionVisibility: FilterItemSelect;

    public readonly optionInherited: FilterItemCheckbox;

    public readonly optionExternals: FilterItemCheckbox;

    constructor(options: IComponentOptions) {
        super(options);

        this.optionVisibility = new FilterItemSelect("visibility");
        this.optionInherited = new FilterItemCheckbox("inherited");
        this.optionExternals = new FilterItemCheckbox("externals");
    }

    static isSupported(): boolean {
        try {
            return typeof window.localStorage != "undefined";
        } catch (e) {
            return false;
        }
    }
}
