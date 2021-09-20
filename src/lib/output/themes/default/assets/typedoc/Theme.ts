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

function setTheme(theme: ThemeChoice) {
    document.documentElement.dataset.theme = theme;
}
