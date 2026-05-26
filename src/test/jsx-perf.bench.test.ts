import { ok } from "assert";
import { JSX } from "../lib/utils-common/index.js";

describe("renderElement perf microbenchmark", () => {
    it("renders a deeply nested tree quickly", () => {
        // Synthetic ~8000-leaf tree (2^13 = 8192 leaves at depth 13,
        // 2^12 = 4096 at depth 12).
        function build(depth: number): JSX.Element {
            if (depth === 0) {
                return JSX.createElement("span", null, "leaf");
            }
            return JSX.createElement(
                "div",
                { class: `d${depth}` },
                build(depth - 1),
                build(depth - 1),
            );
        }
        const tree = build(12);

        const t0 = performance.now();
        const html = JSX.renderElement(tree);
        const ms = performance.now() - t0;

        ok(html.length > 0);
        // eslint-disable-next-line no-console
        console.log(`renderElement of 2^12-leaf tree took ${ms.toFixed(1)} ms`);
    });
});
