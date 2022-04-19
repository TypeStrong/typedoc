import { storage } from "./utils/storage";

type ThemeChoice = "os" | "light" | "dark";

export function initTheme(choices: HTMLOptionElement) {
    const savedTheme = (storage.getItem("tsd-theme") as ThemeChoice) || "os";
    choices.value = savedTheme;
    setTheme(savedTheme);

    choices.addEventListener("change", () => {
        storage.setItem("tsd-theme", choices.value);
        setTheme(choices.value as ThemeChoice);
    });
}

// Also see:
// - src/lib/output/themes/defaults/layouts/default.tsx
// - src/lib/utils/highlighter.tsx
function setTheme(theme: ThemeChoice) {
    document.documentElement.dataset.theme = theme;
}
