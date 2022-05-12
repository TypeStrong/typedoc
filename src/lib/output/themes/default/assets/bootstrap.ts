import { Application, registerComponent } from "./typedoc/Application";
import { MenuHighlight } from "./typedoc/components/MenuHighlight";
import { initSearch } from "./typedoc/components/Search";
import { Signature } from "./typedoc/components/Signature";
import { Toggle } from "./typedoc/components/Toggle";
import { Filter } from "./typedoc/components/Filter";
import { initTheme } from "./typedoc/Theme";

initSearch();

registerComponent(MenuHighlight, ".menu-highlight");
registerComponent(Signature, ".tsd-signatures");
registerComponent(Toggle, "a[data-toggle]");

if (Filter.isSupported()) {
    registerComponent(Filter, "#tsd-filter");
} else {
    document.documentElement.classList.add("no-filter");
}

const themeChoice = document.getElementById("theme");
if (themeChoice) {
    initTheme(themeChoice as HTMLOptionElement);
}

const app: Application = new Application();

Object.defineProperty(window, "app", { value: app });
