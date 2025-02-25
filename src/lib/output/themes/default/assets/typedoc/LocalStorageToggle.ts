import { localStorageManager } from "./LocalStorageManager.js";

export function initLocalStorageToggle(checkboxId: string) {
    document.addEventListener("DOMContentLoaded", () => {
        const checkbox = document.getElementById(
            checkboxId,
        ) as HTMLInputElement;
        if (checkbox) {
            // Initialize the checkbox state based on the current value of the data attribute
            checkbox.checked =
                document.documentElement.dataset.disableLocalStorage === "true";

            // Add an event listener to toggle the data attribute when the checkbox is clicked
            checkbox.addEventListener("change", () => {
                document.documentElement.dataset.disableLocalStorage =
                    checkbox.checked.toString();
            });
        }

        // Add a MutationObserver to monitor changes to the data-disable-local-storage attribute
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "data-disable-local-storage"
                ) {
                    const disableLocalStorage =
                        document.documentElement.dataset.disableLocalStorage ===
                        "true";
                    checkbox.checked = disableLocalStorage;
                    localStorageManager.handleDisableLocalStorageChange(
                        disableLocalStorage,
                    );
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-disable-local-storage"],
        });
    });
}
