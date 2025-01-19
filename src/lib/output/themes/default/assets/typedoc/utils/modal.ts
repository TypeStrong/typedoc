/**
 * @module
 *
 * Browsers allow scrolling of page with native dialog, which is a UX issue.
 *
 * @see
 * - https://github.com/whatwg/html/issues/7732
 * - https://github.com/whatwg/html/issues/7732#issuecomment-2437820350
 */

/** Fills the gap that scrollbar occupies. Call when the modal is opened */
export function hideScrollbar() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
    // Should be computed *before* body overflow is set to hidden
    const width = Math.abs(
        window.innerWidth - document.documentElement.clientWidth,
    );

    document.body.style.overflow = "hidden";

    // Give padding to element to balance the hidden scrollbar width
    document.body.style.paddingRight = `${width}px`;
}

/** Resets style changes made by {@link hideScrollbar} */
export function resetScrollbar() {
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
}
