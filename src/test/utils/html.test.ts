import { strictEqual as equal } from "assert";
import { getTextContent } from "../../lib/utils/html";

describe("getTextContent", () => {
    it("Handles simple text", () => {
        equal(getTextContent("Hello there"), "Hello there");
    });

    it("Handles entity escapes", () => {
        equal(getTextContent("&#65 B"), "A B");
        equal(getTextContent("&#65; B"), "A B");
        equal(getTextContent("&#x41; B"), "A B");
        equal(getTextContent("&#x41 B"), "A B");
        equal(getTextContent("A &amp; B"), "A & B");
    });

    it("Strips HTML tags", () => {
        equal(getTextContent("A <span>B</span> C"), "A B C");
        equal(getTextContent("A <span a=b>B</span> C"), "A B C");
        equal(getTextContent("A <span a='b'>B</span> C"), "A B C");
        equal(getTextContent('A <span a="b">B</span> C'), "A B C");
        equal(getTextContent('A <span a="b"'), "A ");
    });

    it("Handles nested HTML tags", () => {
        equal(getTextContent("A<span>B<span>C</span></span>"), "ABC");
    });

    it("Preserves lt/gt", () => {
        equal(getTextContent("&lt;a&gt;"), "<a>");
    });
});
