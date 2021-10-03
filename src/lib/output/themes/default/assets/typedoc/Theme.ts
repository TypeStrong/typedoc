type ThemeChoice = "os" | "light" | "dark";

export function initTheme(choices: HTMLOptionElement) {
    const savedTheme =
        (localStorage.getItem("tsd-theme") as ThemeChoice) || "os";
    choices.value = savedTheme;
    setTheme(savedTheme);

    choices.addEventListener("change", () => {
        localStorage.setItem("tsd-theme", choices.value);
        setTheme(choices.value as ThemeChoice);
    });
}

// Also see:
// - src/lib/output/themes/defaults/layouts/default.tsx
// - src/lib/utils/highlighter.tsx
function setTheme(theme: ThemeChoice) {
    switch (theme) {
        case "os":
            document.body.classList.remove("light", "dark");
            break;
        case "light":
            document.body.classList.remove("dark");
            document.body.classList.add("light");
            break;
        case "dark":
            document.body.classList.remove("light");
            document.body.classList.add("dark");
            break;
    }
}
