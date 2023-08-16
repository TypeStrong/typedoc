import { deepStrictEqual as equal } from "assert";
import {
    parseComponent,
    parseComponentPath,
    parseDeclarationReference,
    parseMeaning,
    parseModuleSource,
    parseString,
    parseSymbolReference,
} from "../lib/converter/comments/declarationReference";

describe("Declaration References", () => {
    describe("String parsing", () => {
        const parse = (s: string) => parseString(s, 0, s.length)?.[0];

        it("Fails if string does not start with a double quote", () => {
            equal(parse("x"), undefined);
        });

        it("Fails if string includes a line terminator", () => {
            equal(parse('"a\nb"'), undefined);
        });

        it("Fails if string is unclosed", () => {
            equal(parse('"abc'), undefined);
        });

        it("Bails on bad escapes", () => {
            equal(parse('"\\123"'), undefined);
            equal(parse('"\\xZZ"'), undefined);
            equal(parse('"\\uAAAZ"'), undefined);
            equal(parse('"\\u4"'), undefined);
            equal(parse('"\\u{41"'), undefined);
            equal(parse('"\\uZ"'), undefined);
            equal(parse('"\\u{FFFFFFFFFFFFFFFFFFFFFFF}"'), undefined);
        });

        it("Parses successfully", () => {
            equal(parse('"abc\\x41\\u0041\\u{42}z\\n\\a\\0"'), "abcAABz\na\0");
        });
    });

    describe("Component parsing", () => {
        const parse = (s: string) => parseComponent(s, 0, s.length)?.[0];

        it("Fails if it is an invalid string", () => {
            equal(parse('"asdf'), undefined);
        });

        it("Fails if there is no valid string", () => {
            equal(parse(""), undefined);
            equal(parse("\n"), undefined);
        });

        it("Reads valid component", () => {
            equal(parse("abc"), "abc");
            equal(parse('"abc"'), "abc");
        });
    });

    describe("Component Path parsing", () => {
        const parse = (s: string) => parseComponentPath(s, 0, s.length)?.[0];

        it("Fails if it is an invalid string", () => {
            equal(parse('"asdf'), undefined);
        });

        it("Fails if a later part of the path fails to parse", () => {
            equal(parse('a."asdf'), undefined);
        });

        it("Parses a path", () => {
            equal(parse("a.b"), [
                { navigation: ".", path: "a" },
                { navigation: ".", path: "b" },
            ]);
            equal(parse('a#"b"'), [
                { navigation: ".", path: "a" },
                { navigation: "#", path: "b" },
            ]);
        });
    });

    describe("Meaning parsing", () => {
        const parse = (s: string) => {
            const meaning = parseMeaning(s, 0, s.length);
            if (meaning) {
                equal(
                    meaning[1],
                    s.length,
                    "Parse did not consume full string",
                );
            }
            return meaning?.[0];
        };

        it("Fails if string does not start with :", () => {
            equal(parse("class"), undefined);
        });

        it("Parses a bare keyword", () => {
            equal(parse(":class"), { keyword: "class" });
        });

        it("Parses a keyword with index", () => {
            equal(parse(":class(123)"), { keyword: "class", index: 123 });
        });

        it("Does not parse index if invalid", () => {
            const input = ":class(123";
            const meaning = parseMeaning(input, 0, input.length);
            equal(meaning, [{ keyword: "class" }, ":class".length]);
        });

        it("Parses an index", () => {
            equal(parse(":(123)"), { keyword: undefined, index: 123 });
        });

        it("Parses a bare index", () => {
            equal(parse(":123"), { index: 123 });
        });

        it("Parses a user identifier", () => {
            equal(parse(":USER_IDENT"), { label: "USER_IDENT" });
        });
    });

    describe("Symbol reference parsing", () => {
        const parse = (s: string) => parseSymbolReference(s, 0, s.length)?.[0];

        it("Fails if both parses fail", () => {
            equal(parse(":bad"), undefined);
        });

        it("Succeeds if path succeeds", () => {
            equal(parse("a"), {
                path: [{ navigation: ".", path: "a" }],
                meaning: undefined,
            });
        });

        it("Succeeds if meaning succeeds", () => {
            equal(parse(":class"), {
                path: undefined,
                meaning: { keyword: "class" },
            });
        });

        it("Succeeds both succeed", () => {
            equal(parse("a:class(1)"), {
                path: [{ navigation: ".", path: "a" }],
                meaning: { keyword: "class", index: 1 },
            });
        });
    });

    describe("Module source parsing", () => {
        const parse = (s: string) => parseModuleSource(s, 0, s.length)?.[0];

        it("Fails if empty", () => {
            equal(parse(""), undefined);
            equal(parse("!"), undefined);
        });

        it("Parses strings", () => {
            equal(parse('"ab"'), "ab");
        });

        it("Parses module source characters", () => {
            equal(parse("abc.def"), "abc.def");
        });
    });

    describe("Full reference parsing", () => {
        const parse = (s: string) =>
            parseDeclarationReference(s, 0, s.length)?.[0];

        it("Parses module if there is one", () => {
            equal(parse("abc!"), {
                moduleSource: "abc",
                resolutionStart: "global",
                symbolReference: undefined,
            });
        });

        it("Does not parse module if there is not one", () => {
            equal(parse("abc#def"), {
                moduleSource: undefined,
                resolutionStart: "local",
                symbolReference: {
                    path: [
                        { navigation: ".", path: "abc" },
                        { navigation: "#", path: "def" },
                    ],
                    meaning: undefined,
                },
            });
        });

        it("Supports referencing global symbols", () => {
            equal(parse("!abc#def"), {
                moduleSource: undefined,
                resolutionStart: "global",
                symbolReference: {
                    path: [
                        { navigation: ".", path: "abc" },
                        { navigation: "#", path: "def" },
                    ],
                    meaning: undefined,
                },
            });
        });

        it("Doesn't crash with an empty/invalid reference", () => {
            equal(parse(""), undefined);
            equal(parse("@test/foo"), undefined);
        });
    });
});
