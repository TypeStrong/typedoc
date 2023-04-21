import { Application, registerComponent } from "./typedoc/Application";
import { initSearch } from "./typedoc/components/Search";
import { Toggle } from "./typedoc/components/Toggle";
import { Filter } from "./typedoc/components/Filter";
import { Accordion } from "./typedoc/components/Accordion";
import { initTheme } from "./typedoc/Theme";

addEventListener("load", () => {
    initSearch();
    initCopyCode();

    registerComponent(Toggle, "a[data-toggle]");
    registerComponent(Accordion, ".tsd-index-accordion");
    registerComponent(Filter, ".tsd-filter-item input[type=checkbox]");

    const themeChoice = document.getElementById("tsd-theme");
    if (themeChoice) {
        initTheme(themeChoice as HTMLOptionElement);
    }

    const app = new Application();

    Object.defineProperty(window, "app", { value: app });
});

function initCopyCode() {
    document.querySelectorAll("pre > button").forEach((button) => {
        let timeout: ReturnType<typeof setTimeout>;
        button.addEventListener("click", () => {
            if (button.previousElementSibling instanceof HTMLElement) {
                navigator.clipboard.writeText(
                    button.previousElementSibling.innerText.trim()
                );
            }
            button.textContent = "Copied!";
            button.classList.add("visible");
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                button.classList.remove("visible");
                timeout = setTimeout(() => {
                    button.textContent = "Copy";
                }, 100);
            }, 1000);
        });
    });
}
