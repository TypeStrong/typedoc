/**
 * @module
 *
 * Browsers allow scrolling of page with native dialog, which is a UX issue.
 *
 * `@starting-style` and `overlay` aren't well supported in FF, and only available in latest versions of chromium,
 * hence, a custom overlay workaround is required.
 *
 * Workaround:
 *
 * - Append a custom overlay element (a div) to `document.body`,
 *   this does **NOT** handle nested modals,
 *   as the overlay div cannot be in the top layer, which wouldn't overshadow the parent modal.
 *
 * - Add exit animation on dialog and overlay, without actually closing them
 * - Listen for `animationend` event, and close the modal immediately
 *
 * @see
 * - The "[right](https://frontendmasters.com/blog/animating-dialog/)" way to animate modals
 * - [Workaround](https://github.com/whatwg/html/issues/7732#issuecomment-2437820350) to prevent background scrolling
 */

// Constants
const CLOSING_CLASS = "closing";
const OVERLAY_ID = "tsd-overlay";

/** Fills the gap that scrollbar occupies. Call when the modal is opened */
function hideScrollbar() {
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
function resetScrollbar() {
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
}

/** Could be popover too */
type Modal = HTMLDialogElement;

/**
 * Must be called to setup a modal element properly for entry and exit side-effects.
 *
 * Adds event listeners to the modal element, for the closing animation.
 *
 * Adds workaround to fix scrolling issues caused by default browser behavior.
 *
 * @param closingAnimation Name of `@keyframes` for closing animation
 * @param options Configure modal behavior
 * @param options.closeOnEsc Defaults to true
 * @param options.closeOnClick Closes modal when clicked on overlay, defaults to false.
 */
export function setUpModal(
    modal: Modal,
    closingAnimation: string,
    options?: {
        closeOnEsc?: boolean;
        closeOnClick?: boolean;
    },
) {
    // Event listener for closing animation
    modal.addEventListener("animationend", (e) => {
        if (e.animationName !== closingAnimation) return;
        modal.classList.remove(CLOSING_CLASS);
        document.getElementById(OVERLAY_ID)?.remove();
        modal.close();
        resetScrollbar();
    });

    // Override modal cancel behavior, hopefully all browsers have same behavior
    // > When a `<dialog>` is dismissed with the `Esc` key, both the `cancel` and `close` events are fired.
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/cancel_event
    modal.addEventListener("cancel", (e) => {
        e.preventDefault();
        closeModal(modal);
    });

    if (options?.closeOnClick) {
        document.addEventListener(
            "click",
            (e) => {
                if (modal.open && !modal.contains(e.target as HTMLElement)) {
                    closeModal(modal);
                }
            },
            true, // Disable invoking this handler in bubbling phase
        );
    }
}

export function openModal(modal: Modal) {
    if (modal.open) return;

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    document.body.appendChild(overlay);

    modal.showModal();
    hideScrollbar();
}

/** Initiates modal closing, by adding a `closing` class that starts the closing animation */
export function closeModal(modal: Modal) {
    if (!modal.open) return;
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.classList.add(CLOSING_CLASS);
    }
    modal.classList.add(CLOSING_CLASS);
}
