import { debounce } from "../utils/debounce.js";
import { Index } from "lunr";
import { decompressJson } from "../utils/decompress.js";
import { openModal, setUpModal } from "../utils/modal.js";
import { storage } from "../utils/storage.js";

/**
 * Keep this in sync with the interface in src/lib/output/plugins/JavascriptIndexPlugin.ts
 * It's not imported because these are separate TS projects today.
 */
interface SearchDocument {
    id: number;

    kind: number;
    name: string;
    url: string;
    classes?: string;
    parent?: string;
}

interface IData {
    rows: SearchDocument[];
    index: object;
}

declare global {
    interface Window {
        searchData?: string;
    }
}

interface SearchState {
    base: string;
    data?: IData;
    index?: Index;
}

/** Counter to get unique IDs for options */
let optionsIdCounter = 0;

let resultCount = 0;

/** Omit `matchData` for compatibility with recent searches */
type PartialSearch = Omit<Index.Result, "matchData">;

/**
 * Recent search result (which were clicked).
 * Recent searches have their score value set to `0`.
 *
 * Max length: 3
 */
let recentSearches: PartialSearch[] = [];

/**
 * Populates search data into `state`, if available.
 * Removes deault loading message
 */
async function updateIndex(state: SearchState, results: HTMLElement) {
    if (!window.searchData) return;

    try {
        const data: IData = await decompressJson(window.searchData);

        state.data = data;
        state.index = Index.load(data.index);

        results.querySelector("li.state")?.remove();
        recentSearches = parseRecentSearches();
        updateResults(results, "", state);
    } catch (e) {
        console.error(e);
        const message = window.translations.theme_search_index_not_available;
        const stateEl = createStateEl(message);
        results.replaceChildren(stateEl);
    }
}

export function initSearch() {
    const searchTrigger = document.getElementById(
        "tsd-search-trigger",
    ) as HTMLButtonElement | null;

    const searchEl = document.getElementById(
        "tsd-search",
    ) as HTMLDialogElement | null;

    const field = document.getElementById(
        "tsd-search-input",
    ) as HTMLInputElement | null;

    const results = document.getElementById("tsd-search-results");

    const searchScript = document.getElementById(
        "tsd-search-script",
    ) as HTMLScriptElement | null;

    if (!(searchTrigger && searchEl && field && results && searchScript)) {
        throw new Error("Search controls missing");
    }

    const state: SearchState = {
        base: document.documentElement.dataset.base! + "/",
    };

    searchScript.addEventListener("error", () => {
        const message = window.translations.theme_search_index_not_available;
        const stateEl = createStateEl(message);
        results.replaceChildren(stateEl);
    });
    searchScript.addEventListener("load", () => {
        updateIndex(state, results);
    });
    updateIndex(state, results);

    bindEvents(searchTrigger, searchEl, results, field, state);
}

function bindEvents(
    trigger: HTMLButtonElement,
    searchEl: HTMLDialogElement,
    results: HTMLElement,
    field: HTMLInputElement,
    state: SearchState,
) {
    setUpModal(searchEl, "fade-out", { closeOnClick: true });

    trigger.addEventListener("click", () => openModal(searchEl));

    field.addEventListener(
        "input",
        debounce(() => {
            updateResults(results, field.value.trim(), state);
        }, 200),
    );

    field.addEventListener("keydown", (e) => {
        if (resultCount === 0 || e.ctrlKey || e.metaKey || e.altKey) {
            return;
        }

        // Get the visually focused element, if any
        const currentId = field.getAttribute("aria-activedescendant");
        const current = document.getElementById(currentId || "");

        // Remove visual focus on cursor position change
        if (current) {
            switch (e.key) {
                case "Home":
                case "End":
                case "ArrowLeft":
                case "ArrowRight":
                    removeVisualFocus(field);
            }
        }

        if (e.shiftKey) return;

        switch (e.key) {
            case "Enter":
                current?.querySelector("a")?.click();
                break;
            case "ArrowUp":
                setNextResult(results, field, current, -1);
                break;
            case "ArrowDown":
                setNextResult(results, field, current, 1);
                break;
        }
    });

    field.addEventListener("change", () => removeVisualFocus(field));
    field.addEventListener("blur", () => removeVisualFocus(field));

    /**
     * Start searching by pressing slash, or Ctrl+K
     */
    document.body.addEventListener("keydown", (e) => {
        if (e.altKey || e.metaKey || e.shiftKey) return;

        const ctrlK = e.ctrlKey && e.key === "k";
        const slash = !e.ctrlKey && !isKeyboardActive() && e.key === "/";

        if (ctrlK || slash) {
            e.preventDefault();
            openModal(searchEl);
        }
    });

    // Track the option being selected
    results.addEventListener("click", (e) => {
        const target = (e.target as HTMLElement).closest(
            'li[role="option"]',
        ) as HTMLLinkElement | null;
        if (!target) return;

        const ref = target.dataset.ref || "";
        const previousIndex = recentSearches.findIndex((el) => el.ref === ref);
        if (previousIndex === -1) {
            recentSearches.unshift({ ref, score: 0 });
        } else if (previousIndex !== 0) {
            const prev = recentSearches.splice(previousIndex, 1)[0];
            recentSearches.unshift(prev);
        }

        if (recentSearches.length > 3) {
            recentSearches.pop();
        }
        setRecentSearches(recentSearches);
    });
}

function updateResults(
    results: HTMLElement,
    searchText: string,
    state: SearchState,
) {
    // Don't clear results if loading state is not ready,
    // because loading or error message can be removed.
    if (!state.index || !state.data) return;

    results.innerHTML = "";
    optionsIdCounter += 1;

    // Perform a wildcard search
    let res: PartialSearch[];
    if (searchText) {
        // Create a wildcard out of space-separated words in the query,
        // ignoring any extra spaces
        const searchWithWildcards = searchText
            .split(" ")
            .map((x) => {
                return x.length ? `*${x}*` : "";
            })
            .join(" ");
        res = state.index.search(searchWithWildcards);
    } else {
        // Set res as the recent searches
        // when the `searchText` is empty.
        res = recentSearches;
    }

    resultCount = res.length;

    if (searchText) {
        for (let i = 0; i < res.length; i++) {
            const item = res[i];
            const row = state.data.rows[Number(item.ref)];
            let boost = 1;

            // boost by exact match on name
            if (row.name.toLowerCase().startsWith(searchText.toLowerCase())) {
                boost *=
                    1 + 1 / (1 + Math.abs(row.name.length - searchText.length));
            }

            item.score *= boost;
        }

        res.sort((a, b) => b.score - a.score);
    }

    const c = Math.min(10, res.length);
    for (let i = 0; i < c; i++) {
        const row = state.data.rows[Number(res[i].ref)];
        // Ref could be invalid when dealing with localStorage values
        if (!row) continue;
        const icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="tsd-kind-icon"><use href="#icon-${row.kind}"></use></svg>`;

        // Highlight the matched part of the query in the search results
        let name = highlightMatches(row.name, searchText);
        if (globalThis.DEBUG_SEARCH_WEIGHTS) {
            name += ` (score: ${res[i].score.toFixed(2)})`;
        }
        if (row.parent) {
            name = `<span class="parent">
                ${highlightMatches(row.parent, searchText)}.</span>${name}`;
        }

        const item = document.createElement("li");
        item.id = `tsd-search:${optionsIdCounter}-${i}`;
        item.role = "option";
        item.ariaSelected = "false";
        item.dataset.ref = res[i].ref;
        item.classList.value = row.classes ?? "";

        const anchor = document.createElement("a");
        // Make links unfocusable inside option
        anchor.tabIndex = -1;
        anchor.href = state.base + row.url;
        anchor.innerHTML = icon + `<span class="text">${name}</span>`;
        item.append(anchor);

        results.appendChild(item);
    }

    if (results.childElementCount === 0) {
        const message = searchText
            ? window.translations.theme_search_no_results
            : window.translations.theme_search_no_recent_searches;
        const item = createStateEl(message);
        results.appendChild(item);
        return;
    }
}

/**
 * Move the highlight within the result set.
 */
function setNextResult(
    results: HTMLElement,
    field: HTMLInputElement,
    current: Element | null,
    dir: 1 | -1,
) {
    let next: Element | null;
    // If there's no active descendant, select the first or last
    if (dir === 1) {
        next = current?.nextElementSibling || results.firstElementChild;
    } else {
        next = current?.previousElementSibling || results.lastElementChild;
    }

    // When only one child is present.
    if (next === current) return;

    // bad markup
    if (!next || next.role !== "option") {
        console.error("Option missing");
        return;
    }

    next.ariaSelected = "true";
    next.scrollIntoView({ behavior: "smooth", block: "nearest" });
    field.setAttribute("aria-activedescendant", next.id);
    current?.setAttribute("aria-selected", "false");
}

function removeVisualFocus(field: HTMLInputElement) {
    const currentId = field.getAttribute("aria-activedescendant");
    const current = document.getElementById(currentId || "");

    current?.setAttribute("aria-selected", "false");
    field.setAttribute("aria-activedescendant", "");
}

function highlightMatches(text: string, search: string) {
    if (search === "") {
        return text;
    }

    const lowerText = text.toLocaleLowerCase();
    const lowerSearch = search.toLocaleLowerCase();

    const parts: string[] = [];
    let lastIndex = 0;
    let index = lowerText.indexOf(lowerSearch);
    while (index != -1) {
        parts.push(
            escapeHtml(text.substring(lastIndex, index)),
            `<mark>${escapeHtml(
                text.substring(index, index + lowerSearch.length),
            )}</mark>`,
        );

        lastIndex = index + lowerSearch.length;
        index = lowerText.indexOf(lowerSearch, lastIndex);
    }

    parts.push(escapeHtml(text.substring(lastIndex)));

    return parts.join("");
}

const SPECIAL_HTML = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;",
} as const;

function escapeHtml(text: string) {
    return text.replace(
        /[&<>"'"]/g,
        (match) => SPECIAL_HTML[match as keyof typeof SPECIAL_HTML],
    );
}

/**
 * Returns a `li` element, with `state` class,
 * @param message Message to set as **innerHTML**
 */
function createStateEl(message: string) {
    const stateEl = document.createElement("li");
    stateEl.className = "state";
    stateEl.innerHTML = message;
    return stateEl;
}

/**
 * <input /> that don't take printable character input from keyboard,
 * to avoid catching "/" when active.
 *
 * based on [MDN: input types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types)
 */
const inputWithoutKeyboard = [
    "button",
    "checkbox",
    "file",
    "hidden",
    "image",
    "radio",
    "range",
    "reset",
    "submit",
];

/** Checks whether keyboard is active, i.e. an input is focused */
function isKeyboardActive() {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) return false;

    if (
        activeElement.isContentEditable ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "SEARCH"
    )
        return true;

    return (
        activeElement.tagName === "INPUT" &&
        !inputWithoutKeyboard.includes((activeElement as HTMLInputElement).type)
    );
}

/**
 * Gets recent searches from localStorage, parses, and returns
 *
 * This implementation in "unforgiving",
 * i.e. the parsed value must match the criteria: string array of length <= 3
 *
 * Returns empty array in case of failure
 * @returns
 */
function parseRecentSearches() {
    try {
        const recent = storage.getItem("tsd-search-recent")!;
        const parsed = JSON.parse(recent);
        if (Array.isArray(parsed) && parsed.length <= 3) {
            return parsed.map((ref) => {
                if (isNaN(Number(ref))) throw new Error("Invalid ref");

                return {
                    ref,
                    score: 0,
                } satisfies PartialSearch;
            });
        }
        return [];
    } catch {
        return [];
    }
}

/**
 * Save recentSearches to localStorage.
 * Performs no checks on the argument.
 */
function setRecentSearches(recent: PartialSearch[]) {
    storage.setItem(
        "tsd-search-recent",
        JSON.stringify(recent.map(({ ref }) => ref)),
    );
}
