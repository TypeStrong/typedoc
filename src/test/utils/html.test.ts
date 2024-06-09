import { deepStrictEqual as equal } from "assert";
import { HtmlAttributeParser, ParserState } from "../../lib/utils/html";

describe("HtmlAttributeParser", () => {
    enum State {
        BeforeAttributeName = "BeforeAttributeName",
        AfterAttributeName = "AfterAttributeName",
        BeforeAttributeValue = "BeforeAttributeValue",
    }

    function stateStr(state: ParserState) {
        return {
            [ParserState.BeforeAttributeName]: State.BeforeAttributeName,
            [ParserState.AfterAttributeName]: State.AfterAttributeName,
            [ParserState.BeforeAttributeValue]: State.BeforeAttributeValue,
            [ParserState.END]: "<END>",
        }[state];
    }

    function parseWithEnd(text: string) {
        const parser = new HtmlAttributeParser(text);
        const data = [];
        do {
            parser.step();
            data.push([
                stateStr(parser.state),
                parser.currentAttributeName,
                parser.currentAttributeValue,
            ]);
        } while (parser.state != ParserState.END);
        return data;
    }

    function parse(text: string) {
        const data = parseWithEnd(text);
        data.pop();
        return data;
    }

    function parseAttrsToObject(text: string) {
        const result: Record<string, string> = {};
        for (const elem of parseWithEnd(text)) {
            result[elem[1]] = elem[2];
        }
        delete result[""];
        return result;
    }

    it("Handles self closing tag", () => {
        equal(parse("  >"), []);

        equal(parse("  />"), []);
    });

    it("Handles EOF before end of tag", () => {
        equal(parse(" \t\f"), []);
    });

    it("Handles names without values", () => {
        equal(parse("a b c />"), [
            [State.AfterAttributeName, "a", ""],
            [State.AfterAttributeName, "b", ""],
            [State.AfterAttributeName, "c", ""],
        ]);
    });

    it("Handles unquoted value", () => {
        equal(parse("a=1 b=bbb />"), [
            [State.BeforeAttributeValue, "a", ""],
            [State.BeforeAttributeName, "a", "1"],
            [State.BeforeAttributeValue, "b", ""],
            [State.BeforeAttributeName, "b", "bbb"],
        ]);
    });

    it("Handles single quoted value", () => {
        equal(parse("a='1' b='b b' />"), [
            [State.BeforeAttributeValue, "a", ""],
            [State.BeforeAttributeName, "a", "1"],
            [State.BeforeAttributeValue, "b", ""],
            [State.BeforeAttributeName, "b", "b b"],
        ]);
    });

    it("Handles double quoted value", () => {
        equal(parse('a="1" b="b b" />'), [
            [State.BeforeAttributeValue, "a", ""],
            [State.BeforeAttributeName, "a", "1"],
            [State.BeforeAttributeValue, "b", ""],
            [State.BeforeAttributeName, "b", "b b"],
        ]);
    });

    it("Handles named escapes", () => {
        equal(parse('a="&amp;" b="&amp" />'), [
            [State.BeforeAttributeValue, "a", ""],
            [State.BeforeAttributeName, "a", "&"],
            [State.BeforeAttributeValue, "b", ""],
            [State.BeforeAttributeName, "b", "&"],
        ]);
    });

    it("Handles invalid named escape", () => {
        equal(parse('a="&ZZBADESCAPE;" />'), [
            [State.BeforeAttributeValue, "a", ""],
            [State.BeforeAttributeName, "a", "&ZZBADESCAPE;"],
        ]);
    });

    it("Handles an attribute without a name", () => {
        equal(parse(" =oops >"), [
            [State.BeforeAttributeValue, "", ""],
            [State.BeforeAttributeName, "", "oops"],
        ]);
    });

    it("Handles invalid characters in attribute names", () => {
        equal(parse(" a\" a' a< >"), [
            [State.AfterAttributeName, 'a"', ""],
            [State.AfterAttributeName, "a'", ""],
            [State.AfterAttributeName, "a<", ""],
        ]);
    });

    it("Handles missing attribute value", () => {
        equal(parse(" a= \t\n\f>"), [[State.BeforeAttributeValue, "a", ""]]);
    });

    it("Handles a null character in a double quoted attribute value", () => {
        equal(parse(' a="\0" >'), [
            [State.BeforeAttributeValue, "a", ""],
            [State.BeforeAttributeName, "a", "\ufffd"],
        ]);
    });

    it("Handles an unterminated double quoted attribute value", () => {
        equal(parse(' a="x'), [[State.BeforeAttributeValue, "a", ""]]);
    });

    it("Handles missing attribute name after an attribute ", () => {
        equal(parse(" a \t\n\f =>"), [
            [State.AfterAttributeName, "a", ""],
            [State.BeforeAttributeValue, "a", ""],
        ]);
    });

    it("Handles named escapes in single quoted value", () => {
        equal(parse("a='&amp;' b='&amp' c='&ampoops' />"), [
            [State.BeforeAttributeValue, "a", ""],
            [State.BeforeAttributeName, "a", "&"],
            [State.BeforeAttributeValue, "b", ""],
            [State.BeforeAttributeName, "b", "&"],
            [State.BeforeAttributeValue, "c", ""],
            [State.BeforeAttributeName, "c", "&ampoops"],
        ]);
    });

    it("Handles a null character in a single quoted attribute value", () => {
        equal(parse(" a='\0' >"), [
            [State.BeforeAttributeValue, "a", ""],
            [State.BeforeAttributeName, "a", "\ufffd"],
        ]);
    });

    it("Handles an unterminated single quoted attribute value", () => {
        equal(parse(" a='x"), [[State.BeforeAttributeValue, "a", ""]]);
    });

    it("Properly terminates unquoted attributes", () => {
        equal(parseAttrsToObject(" a=a\t b=b\n c=c\f"), {
            a: "a",
            b: "b",
            c: "c",
        });
    });

    it("Handles character references in unquoted attributes", () => {
        equal(parseAttrsToObject(" a=&amp;a b=&amp c=&ampoops >"), {
            a: "&a",
            b: "&",
            c: "&ampoops",
        });
    });

    it("Handles more unquoted attribute cases", () => {
        equal(parseAttrsToObject(" a=a>"), {
            a: "a",
        });

        equal(parseAttrsToObject(" a=\0x>"), {
            a: "\ufffdx",
        });

        equal(parseAttrsToObject(" a=a\"'<=`>"), {
            a: "a\"'<=`",
        });

        equal(parseAttrsToObject(" a=a"), {
            a: "a",
        });
    });

    it("Handles characters after a quoted attribute", () => {
        equal(parseAttrsToObject(" a='a'\tb='b'\nc='c'\fd='d'>"), {
            a: "a",
            b: "b",
            c: "c",
            d: "d",
        });

        equal(parseAttrsToObject(" a='a'/"), {
            a: "a",
        });

        equal(parseAttrsToObject(" a='a'"), {
            a: "a",
        });

        equal(parseAttrsToObject(" a='a'b='b' "), {
            a: "a",
            b: "b",
        });
    });

    it("Handles simple numeric character references", () => {
        equal(parseAttrsToObject("a=&#97; b=&#x5A; c=&#X5a;"), {
            a: "a",
            b: "Z",
            c: "Z",
        });
    });

    it("Handles an invalid character reference", () => {
        equal(parseAttrsToObject("a=&&#97;"), {
            a: "&a",
        });
    });

    it("Handles an invalid decimal character reference start", () => {
        equal(parseAttrsToObject("a=&#;"), {
            a: "&#;",
        });
    });

    it("Handles an invalid hex character reference", () => {
        equal(parseAttrsToObject("a=&#x;"), {
            a: "&#x;",
        });

        equal(parseAttrsToObject("a=&#x5A>"), {
            a: "Z",
        });
    });

    it("Handles an ambiguous ampersand without a trailing alphanumeric", () => {
        equal(parseAttrsToObject("a=&a"), {
            a: "&a",
        });
    });

    it("Handles an invalid decimal character reference end", () => {
        equal(parseAttrsToObject("a=&#97>"), {
            a: "a",
        });
    });

    it("Handles invalid characters in numeric character references", () => {
        equal(parseAttrsToObject("a='nul:&#0;x'>"), {
            a: "nul:\ufffdx",
        });
        equal(parseAttrsToObject("a='rng:&#x11ffff;x'>"), {
            a: "rng:\ufffdx",
        });
        equal(parseAttrsToObject("a='leading surrogate:&#xd801;x'>"), {
            a: "leading surrogate:\ufffdx",
        });
        equal(parseAttrsToObject("a='trailing surrogate:&#xdc01;x'>"), {
            a: "trailing surrogate:\ufffdx",
        });
    });
});
