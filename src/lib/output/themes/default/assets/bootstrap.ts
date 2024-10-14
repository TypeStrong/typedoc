import { Application, registerComponent } from "./typedoc/Application.js";
import { initSearch } from "./typedoc/components/Search.js";
import { Toggle } from "./typedoc/components/Toggle.js";
import { Filter } from "./typedoc/components/Filter.js";
import { Accordion } from "./typedoc/components/Accordion.js";
import { initTheme } from "./typedoc/Theme.js";
import { initNav } from "./typedoc/Navigation.js";
import { initHierarchy } from "./typedoc/Hierarchy.js";

registerComponent(Toggle, "a[data-toggle]");
registerComponent(Accordion, ".tsd-accordion");
registerComponent(Filter, ".tsd-filter-item input[type=checkbox]");

const themeChoice = document.getElementById("tsd-theme");
if (themeChoice) {
    initTheme(themeChoice as HTMLOptionElement);
}

declare global {
    var app: Application;
}
const app = new Application();

Object.defineProperty(window, "app", { value: app });

initSearch();
initNav();
initHierarchy();
