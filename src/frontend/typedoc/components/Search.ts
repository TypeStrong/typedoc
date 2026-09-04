import { debounce } from "../utils/debounce.js";
import { Index } from "lunr";
import { decompressJson } from "../utils/decompress.js";
import { openModal, setUpModal } from "../utils/modal.js";
import { classListWillBeFiltered } from "./Filter.js";

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
    icon?: string | number;
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
    /** Full, sorted result set for the current query. */
    results: Index.Result[];
    /** Raw text of the query which produced {@link results}, used to highlight matches. */
    searchText: string;
    /** Zero-based index of the page of {@link results} currently displayed. */
    page: number;
}

interface SearchElements {
    trigger: HTMLButtonElement;
    searchEl: HTMLDialogElement;
    results: HTMLElement;
    field: HTMLInputElement;
    status: HTMLElement;
    pagination: HTMLElement;
    paginationStatus: HTMLElement;
    paginationPrev: HTMLButtonElement;
    paginationNext: HTMLButtonElement;
}

/** Number of results shown on a single page in the search dialog. */
const PAGE_SIZE = 10;

/** Counter to get unique IDs for options */
let optionsIdCounter = 0;

/**
 * Populates search data into `state`, if available.
 * Removes default loading message
 */
async function updateIndex(state: SearchState, status: HTMLElement) {
    if (!window.searchData) return;

    const data: IData = await decompressJson(window.searchData);

    state.data = data;
    state.index = Index.load(data.index);

    status.innerHTML = "";
}

export function initSearch() {
    const trigger = document.getElementById(
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

    const status = document.getElementById("tsd-search-status");

    const pagination = document.getElementById("tsd-search-pagination");
    const paginationStatus = document.getElementById(
        "tsd-search-pagination-status",
    );
    const paginationPrev = document.getElementById(
        "tsd-search-pagination-prev",
    ) as HTMLButtonElement | null;
    const paginationNext = document.getElementById(
        "tsd-search-pagination-next",
    ) as HTMLButtonElement | null;

    if (
        !(trigger && searchEl && field && results && searchScript && status &&
            pagination && paginationStatus && paginationPrev &&
            paginationNext)
    ) {
        throw new Error("Search controls missing");
    }

    const state: SearchState = {
        base: document.documentElement.dataset.base!,
        results: [],
        searchText: "",
        page: 0,
    };
    if (!state.base.endsWith("/")) {
        state.base += "/";
    }

    const elements: SearchElements = {
        trigger,
        searchEl,
        results,
        field,
        status,
        pagination,
        paginationStatus,
        paginationPrev,
        paginationNext,
    };

    searchScript.addEventListener("error", () => {
        const message = window.translations.search_index_not_available;
        updateStatusEl(status, message);
    });
    searchScript.addEventListener("load", () => {
        updateIndex(state, status);
    });
    updateIndex(state, status);

    bindEvents(elements, state);
}

function bindEvents(elements: SearchElements, state: SearchState) {
    const { field, results, searchEl, trigger, paginationPrev, paginationNext } = elements;

    setUpModal(searchEl, { closeOnClick: true });

    function showSearch() {
        openModal(searchEl);
        field.setSelectionRange(0, field.value.length);
    }

    trigger.addEventListener("click", showSearch);

    field.addEventListener(
        "input",
        debounce(() => {
            updateResults(elements, state);
        }, 200),
    );

    function goToPage(dir: 1 | -1) {
        const totalPages = Math.max(1, Math.ceil(state.results.length / PAGE_SIZE));
        const nextPage = state.page + dir;
        if (nextPage < 0 || nextPage >= totalPages) return;

        state.page = nextPage;
        removeVisualFocus(field);
        renderResultsPage(elements, state);
        results.scrollTop = 0;
    }

    paginationPrev.addEventListener("click", () => goToPage(-1));
    paginationNext.addEventListener("click", () => goToPage(1));

    field.addEventListener("keydown", (e) => {
        if (
            results.childElementCount === 0 ||
            e.ctrlKey ||
            e.metaKey ||
            e.altKey
        ) {
            return;
        }

        // Get the visually focused element, if any
        const currentId = field.getAttribute("aria-activedescendant");
        const current = currentId ? document.getElementById(currentId) : null;

        // Remove visual focus on cursor position change
        if (current) {
            let verticalArrowSelection = false;
            let cursorPosChange = false;
            switch (e.key) {
                case "Home":
                case "End":
                case "ArrowLeft":
                case "ArrowRight":
                    cursorPosChange = true;
                    break;
                case "ArrowDown":
                case "ArrowUp":
                    verticalArrowSelection = e.shiftKey;
                    break;
            }
            if (verticalArrowSelection || cursorPosChange) {
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
                e.preventDefault();
                break;
            case "ArrowDown":
                setNextResult(results, field, current, 1);
                e.preventDefault();
                break;
            case "PageUp":
                goToPage(-1);
                e.preventDefault();
                break;
            case "PageDown":
                goToPage(1);
                e.preventDefault();
                break;
        }
    });

    function visualBlurHandler() {
        removeVisualFocus(field);
    }

    field.addEventListener("change", visualBlurHandler);
    field.addEventListener("blur", visualBlurHandler);
    field.addEventListener("click", visualBlurHandler);

    /**
     * Start searching by pressing slash, or Ctrl+K
     */
    document.body.addEventListener("keydown", (e) => {
        if (e.altKey || e.metaKey || e.shiftKey) return;

        const ctrlK = e.ctrlKey && e.key === "k";
        const slash = !e.ctrlKey && !isKeyboardActive() && e.key === "/";

        if (ctrlK || slash) {
            e.preventDefault();
            showSearch();
        }
    });
}

function updateResults(elements: SearchElements, state: SearchState) {
    // Don't clear results if loading state is not ready,
    // because loading or error message can be removed.
    if (!state.index || !state.data) return;

    const { results, field, status } = elements;

    results.innerHTML = "";
    status.innerHTML = "";

    const searchText = field.value.trim();
    state.searchText = searchText;
    state.page = 0;

    // Perform a wildcard search
    let res: Index.Result[];
    if (searchText) {
        // Create a wildcard out of space-separated words in the query,
        // ignoring any extra spaces
        const searchWithWildcards = searchText
            .split(" ")
            .map((x) => {
                return x.length ? `*${x}*` : "";
            })
            .join(" ");

        res = state.index
            .search(searchWithWildcards)
            // filter out active *filters* manually, since lunr doesn't support it.
            .filter(({ ref }) => {
                const classes = state.data!.rows[Number(ref)].classes;
                return !classes || !classListWillBeFiltered(classes);
            });
    } else {
        // Set empty `res` to prevent getting random results with wildcard search
        // when the `searchText` is empty.
        res = [];
    }

    if (res.length === 0 && searchText) {
        const message = window.translations.search_no_results_found_for_0.replace(
            "{0}",
            ` "<strong>${escapeHtml(searchText)}</strong>" `,
        );
        updateStatusEl(status, message);
        state.results = [];
        updatePagination(elements, state);
        return;
    }

    for (let i = 0; i < res.length; i++) {
        const item = res[i];
        const row = state.data.rows[Number(item.ref)];
        let boost = 1;

        // boost by exact match on name
        if (row.name.toLowerCase().startsWith(searchText.toLowerCase())) {
            boost *= 10 / (1 + Math.abs(row.name.length - searchText.length));
        }

        item.score *= boost;
    }

    res.sort((a, b) => b.score - a.score);

    state.results = res;
    renderResultsPage(elements, state);
}

/**
 * Renders the page of {@link SearchState.results} indicated by {@link SearchState.page}
 * into the results list, and updates the pagination controls to match.
 */
function renderResultsPage(elements: SearchElements, state: SearchState) {
    const { results } = elements;

    results.innerHTML = "";
    optionsIdCounter += 1;

    const start = state.page * PAGE_SIZE;
    const pageResults = state.results.slice(start, start + PAGE_SIZE);

    for (let i = 0; i < pageResults.length; i++) {
        const row = state.data!.rows[Number(pageResults[i].ref)];
        const label = window.translations[`kind_${row.kind}`].replaceAll(
            '"',
            "&quot;",
        );
        const icon = `<svg width="20" height="20" class="tsd-kind-icon" aria-label="${label}"><use href="#icon-${
            row.icon || row.kind
        }"></use></svg>`;

        // Highlight the matched part of the query in the search results
        let name = highlightMatches(row.name, state.searchText);
        if (globalThis.DEBUG_SEARCH_WEIGHTS) {
            name += ` (score: ${pageResults[i].score.toFixed(2)})`;
        }
        if (row.parent) {
            name = `<span class="parent">
                ${highlightMatches(row.parent, state.searchText)}.</span>${name}`;
        }

        const item = document.createElement("li");
        item.id = `tsd-search:${optionsIdCounter}-${i}`;
        item.role = "option";
        item.ariaSelected = "false";
        item.classList.value = row.classes ?? "";

        const anchor = document.createElement("a");
        // Make links unfocusable inside option
        anchor.tabIndex = -1;
        anchor.href = state.base + row.url;
        anchor.innerHTML = icon + `<span class="text">${name}</span>`;
        item.append(anchor);

        results.appendChild(item);
    }

    updatePagination(elements, state);
}

/**
 * Shows/hides the pagination controls and keeps their labels & disabled state
 * in sync with {@link SearchState.page}.
 */
function updatePagination(elements: SearchElements, state: SearchState) {
    const { pagination, paginationStatus, paginationPrev, paginationNext } = elements;

    const totalPages = Math.max(1, Math.ceil(state.results.length / PAGE_SIZE));
    if (totalPages <= 1) {
        pagination.hidden = true;
        return;
    }

    pagination.hidden = false;
    paginationStatus.textContent = window.translations.search_page_0_of_1
        .replace("{0}", String(state.page + 1))
        .replace("{1}", String(totalPages));
    paginationPrev.disabled = state.page === 0;
    paginationNext.disabled = state.page >= totalPages - 1;
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
    const current = currentId ? document.getElementById(currentId) : null;

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
            `<mark>${
                escapeHtml(
                    text.substring(index, index + lowerSearch.length),
                )
            }</mark>`,
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
 * Updates the status element, with aria-live attribute, which should be announced to the user.
 * @param message Message to set as **innerHTML** in a wrapper element, if not empty.
 */
function updateStatusEl(status: HTMLElement, message: string) {
    status.innerHTML = message ? `<div>${message}</div>` : "";
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
    ) {
        return true;
    }

    return (
        activeElement.tagName === "INPUT" &&
        !inputWithoutKeyboard.includes((activeElement as HTMLInputElement).type)
    );
}
