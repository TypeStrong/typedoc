import { Application, registerComponent } from "./typedoc/Application";
import { MenuHighlight } from "./typedoc/components/MenuHighlight";
import { initSearch } from "./typedoc/components/Search";
import { Signature } from "./typedoc/components/Signature";
import { Toggle } from "./typedoc/components/Toggle";
import { Filter } from "./typedoc/components/Filter";
import { Accordion } from "./typedoc/components/Accordion";
import { initTheme } from "./typedoc/Theme";

initSearch();

registerComponent(MenuHighlight, ".menu-highlight");
registerComponent(Signature, ".tsd-signatures");
registerComponent(Toggle, "a[data-toggle]");
registerComponent(Accordion, ".tsd-index-accordion");
registerComponent(Filter, ".tsd-filter-item input[type=checkbox]");


const themeChoice = document.getElementById("theme");
if (themeChoice) {
    initTheme(themeChoice as HTMLOptionElement);
}

const app: Application = new Application();

Object.defineProperty(window, "app", { value: app });
