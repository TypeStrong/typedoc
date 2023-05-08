import { Application, registerComponent } from "./typedoc/Application";
import { initSearch } from "./typedoc/components/Search";
import { Toggle } from "./typedoc/components/Toggle";
import { Filter } from "./typedoc/components/Filter";
import { Accordion } from "./typedoc/components/Accordion";
import { initTheme } from "./typedoc/Theme";

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

// Safari is broken and doesn't let you click on a link within
// a <summary> tag, so we have to manually handle clicks there.
document.querySelectorAll("summary a").forEach((el) => {
    el.addEventListener("click", () => {
        location.assign((el as HTMLAnchorElement).href);
    });
});
