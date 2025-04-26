import { deepStrictEqual as equal } from "node:assert";
import { wbr } from "../../lib/output/themes/lib.js";
import { JSX } from "#utils";

describe("wbr", () => {
    it("No breaks", () => {
        equal(wbr("hello"), ["hello"]);
    });

    it("Adds <wbr> to camelCased text", () => {
        equal(wbr("helloWorld"), ["hello", <wbr />, "World"]);
        equal(wbr("helloWorldMulti"), ["hello", <wbr />, "World", <wbr />, "Multi"]);
    });

    it("Adds <wbr> to snake_cased text", () => {
        equal(wbr("snake_case_text"), ["snake_", <wbr />, "case_", <wbr />, "text"]);
        equal(wbr("snake__case__text"), ["snake__", <wbr />, "case__", <wbr />, "text"]);
    });

    it("Adds <wbr> to dashed-text", () => {
        equal(wbr("dashed-text"), ["dashed-", <wbr />, "text"]);
    });

    it("Adds <wbr> appropriately with acronyms", () => {
        equal(wbr("HTMLImageElement"), ["HTML", <wbr />, "Image", <wbr />, "Element"]);
        equal(wbr("theHTMLImageElement"), ["the", <wbr />, "HTML", <wbr />, "Image", <wbr />, "Element"]);
    });
});
