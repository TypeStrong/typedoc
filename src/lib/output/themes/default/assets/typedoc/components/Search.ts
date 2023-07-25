import { debounce } from "../utils/debounce";
import { Index } from "lunr";

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
        searchData?: IData;
    }
}

interface SearchState {
    base: string;
    data?: IData;
    index?: Index;
}

export function initSearch() {
    const searchEl = document.getElementById("tsd-search");
    if (!searchEl) return;

    const searchScript = document.getElementById(
        "tsd-search-script",
    ) as HTMLScriptElement | null;
    searchEl.classList.add("loading");
    if (searchScript) {
        searchScript.addEventListener("error", () => {
            searchEl.classList.remove("loading");
            searchEl.classList.add("failure");
        });
        searchScript.addEventListener("load", () => {
            searchEl.classList.remove("loading");
            searchEl.classList.add("ready");
        });
        if (window.searchData) {
            searchEl.classList.remove("loading");
        }
    }

    const field = document.querySelector<HTMLInputElement>("#tsd-search input");
    const results = document.querySelector<HTMLElement>("#tsd-search .results");

    if (!field || !results) {
        throw new Error(
            "The input field or the result list wrapper was not found",
        );
    }

    let resultClicked = false;
    results.addEventListener("mousedown", () => (resultClicked = true));
    results.addEventListener("mouseup", () => {
        resultClicked = false;
        searchEl.classList.remove("has-focus");
    });

    field.addEventListener("focus", () => searchEl.classList.add("has-focus"));
    field.addEventListener("blur", () => {
        if (!resultClicked) {
            resultClicked = false;
            searchEl.classList.remove("has-focus");
        }
    });

    const state: SearchState = {
        base: searchEl.dataset["base"] + "/",
    };

    bindEvents(searchEl, results, field, state);
}

function bindEvents(
    searchEl: HTMLElement,
    results: HTMLElement,
    field: HTMLInputElement,
    state: SearchState,
) {
    field.addEventListener(
        "input",
        debounce(() => {
            updateResults(searchEl, results, field, state);
        }, 200),
    );

    let preventPress = false;
    field.addEventListener("keydown", (e) => {
        preventPress = true;
        if (e.key == "Enter") {
            gotoCurrentResult(results, field);
        } else if (e.key == "Escape") {
            field.blur();
        } else if (e.key == "ArrowUp") {
            setCurrentResult(results, -1);
        } else if (e.key === "ArrowDown") {
            setCurrentResult(results, 1);
        } else {
            preventPress = false;
        }
    });
    field.addEventListener("keypress", (e) => {
        if (preventPress) e.preventDefault();
    });

    /**
     * Start searching by pressing slash.
     */
    document.body.addEventListener("keydown", (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (!field.matches(":focus") && e.key === "/") {
            field.focus();
            e.preventDefault();
        }
    });
}

function checkIndex(state: SearchState, searchEl: HTMLElement) {
    if (state.index) return;

    if (window.searchData) {
        searchEl.classList.remove("loading");
        searchEl.classList.add("ready");
        state.data = window.searchData;
        state.index = Index.load(window.searchData.index);
    }
}

function updateResults(
    searchEl: HTMLElement,
    results: HTMLElement,
    query: HTMLInputElement,
    state: SearchState,
) {
    checkIndex(state, searchEl);
    // Don't clear results if loading state is not ready,
    // because loading or error message can be removed.
    if (!state.index || !state.data) return;

    results.textContent = "";

    const searchText = query.value.trim();

    // Perform a wildcard search
    // Set empty `res` to prevent getting random results with wildcard search
    // when the `searchText` is empty.
    let res = searchText ? state.index.search(`*${searchText}*`) : [];

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

    if (res.length === 0) {
        let item = document.createElement("li");
        item.classList.add("no-results");

        let anchor = document.createElement("span");
        anchor.textContent = "No results found";

        item.appendChild(anchor);
        results.appendChild(item);
    }

    res.sort((a, b) => b.score - a.score);

    for (let i = 0, c = Math.min(10, res.length); i < c; i++) {
        const row = state.data.rows[Number(res[i].ref)];

        // Bold the matched part of the query in the search results
        let name = boldMatches(row.name, searchText);
        if (globalThis.DEBUG_SEARCH_WEIGHTS) {
            name += ` (score: ${res[i].score.toFixed(2)})`;
        }
        if (row.parent) {
            name = `<span class="parent">${boldMatches(
                row.parent,
                searchText,
            )}.</span>${name}`;
        }

        const item = document.createElement("li");
        item.classList.value = row.classes ?? "";

        const anchor = document.createElement("a");
        anchor.href = state.base + row.url;
        anchor.innerHTML = name;
        item.append(anchor);

        results.appendChild(item);
    }
}

/**
 * Move the highlight within the result set.
 */
function setCurrentResult(results: HTMLElement, dir: number) {
    let current = results.querySelector(".current");
    if (!current) {
        current = results.querySelector(
            dir == 1 ? "li:first-child" : "li:last-child",
        );
        if (current) {
            current.classList.add("current");
        }
    } else {
        let rel: Element | undefined = current;
        // Tricky: We have to check that rel has an offsetParent so that users can't mark a hidden result as
        // current with the arrow keys.
        if (dir === 1) {
            do {
                rel = rel.nextElementSibling ?? undefined;
            } while (rel instanceof HTMLElement && rel.offsetParent == null);
        } else {
            do {
                rel = rel.previousElementSibling ?? undefined;
            } while (rel instanceof HTMLElement && rel.offsetParent == null);
        }

        if (rel) {
            current.classList.remove("current");
            rel.classList.add("current");
        }
    }
}

/**
 * Navigate to the highlighted result.
 */
function gotoCurrentResult(results: HTMLElement, field: HTMLInputElement) {
    let current = results.querySelector(".current");

    if (!current) {
        current = results.querySelector("li:first-child");
    }

    if (current) {
        const link = current.querySelector("a");
        if (link) {
            window.location.href = link.href;
        }
        field.blur();
    }
}

function boldMatches(text: string, search: string) {
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
            `<b>${escapeHtml(
                text.substring(index, index + lowerSearch.length),
            )}</b>`,
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
