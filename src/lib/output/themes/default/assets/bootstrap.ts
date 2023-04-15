import { Application, registerComponent } from "./typedoc/Application";
import { initSearch } from "./typedoc/components/Search";
import { Toggle } from "./typedoc/components/Toggle";
import { Filter } from "./typedoc/components/Filter";
import { Accordion } from "./typedoc/components/Accordion";
import { initTheme } from "./typedoc/Theme";

addEventListener("load", () => {
    initSearch();

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
