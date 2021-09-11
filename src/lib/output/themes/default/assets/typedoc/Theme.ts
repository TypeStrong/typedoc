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
    switch (theme) {
        case "os":
            document.documentElement.classList.remove("light", "dark");
            break;
        case "light":
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.add("light");
            break;
        case "dark":
            document.documentElement.classList.remove("light");
            document.documentElement.classList.add("dark");
            break;
    }
}
