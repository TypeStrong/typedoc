/**
 * Parser for declaration references, see the [TSDoc grammar](https://github.com/microsoft/tsdoc/blob/main/tsdoc/src/beta/DeclarationReference.grammarkdown)
 * for reference. TypeDoc **does not** support the full grammar today. This is intentional, since the TSDoc
 * specified grammar allows the user to construct nonsensical declaration references such as `abc![def!ghi]`
 *
 * @module
 */

export const MeaningKeywords = [
    `class`, // SymbolFlags.Class
    `interface`, // SymbolFlags.Interface
    `type`, // SymbolFlags.TypeAlias
    `enum`, // SymbolFlags.Enum
    `namespace`, // SymbolFlags.Module
    `function`, // SymbolFlags.Function
    `var`, // SymbolFlags.Variable
    `constructor`, // SymbolFlags.Constructor
    `member`, // SymbolFlags.ClassMember | SymbolFlags.EnumMember
    `event`, //
    `call`, // SymbolFlags.Signature (for __call)
    `new`, // SymbolFlags.Signature (for __new)
    `index`, // SymbolFlags.Signature (for __index)
    `complex`, // Any complex type
];

const LineTerminator = "\r\n\u2028\u2029";
const Punctuators = "{}()[]!.#~:,";
const FutureReservedPunctuator = "{}@";
const NavigationPunctuator = ".#~";
const DecimalDigit = "0123456789";
const HexDigit = DecimalDigit + "abcdefABCDEF";
const SingleEscapeCharacter = `'"\\bfnrtv`;
const EscapeCharacter = SingleEscapeCharacter + DecimalDigit + "xu";

function skipWs(source: string, pos: number, end: number) {
    while (pos < end && /\s/.test(source[pos])) {
        pos++;
    }
    return pos;
}

// EscapeSequence::
//     SingleEscapeCharacter
//     NonEscapeCharacter
//     `0` [lookahead != DecimalDigit]
//     HexEscapeSequence
//     UnicodeEscapeSequence
function parseEscapeSequence(
    source: string,
    pos: number,
    end: number
): [string, number] | undefined {
    // SingleEscapeCharacter
    if (SingleEscapeCharacter.includes(source[pos])) {
        return [source[pos], pos + 1];
    }

    // NonEscapeCharacter:: SourceCharacter but not one of EscapeCharacter or LineTerminator
    if (!(EscapeCharacter + LineTerminator).includes(source[pos])) {
        return [source[pos], pos + 1];
    }

    // `0` [lookahead != DecimalDigit]
    if (
        source[pos] === "0" &&
        pos + 1 < end &&
        !DecimalDigit.includes(source[pos + 1])
    ) {
        return ["\x00", pos + 1];
    }

    // HexEscapeSequence:: x HexDigit HexDigit
    if (
        source[pos] === "x" &&
        pos + 2 < end &&
        HexDigit.includes(source[pos + 1]) &&
        HexDigit.includes(source[pos + 2])
    ) {
        return [
            String.fromCharCode(
                parseInt(source.substring(pos + 1, pos + 3), 16)
            ),
            pos + 3,
        ];
    }

    return parseUnicodeEscapeSequence(source, pos, end);
}

// UnicodeEscapeSequence::
//     `u` HexDigit HexDigit HexDigit HexDigit
//     `u` `{` CodePoint `}`
// CodePoint:: > |HexDigits| but only if MV of |HexDigits| ≤ 0x10FFFF
function parseUnicodeEscapeSequence(
    source: string,
    pos: number,
    end: number
): [string, number] | undefined {
    if (source[pos] !== "u" || pos + 1 >= end) {
        console.log("nope u");
        return;
    }

    if (HexDigit.includes(source[pos + 1])) {
        if (
            pos + 4 >= end ||
            !HexDigit.includes(source[pos + 2]) ||
            !HexDigit.includes(source[pos + 3]) ||
            !HexDigit.includes(source[pos + 4])
        ) {
            return;
        }

        return [
            String.fromCharCode(
                parseInt(source.substring(pos + 1, pos + 5), 16)
            ),
            pos + 5,
        ];
    }

    if (
        source[pos + 1] === "{" &&
        pos + 2 < end &&
        HexDigit.includes(source[pos + 2])
    ) {
        let lookahead = pos + 3;

        while (lookahead < end && HexDigit.includes(source[lookahead])) {
            lookahead++;
        }

        if (lookahead >= end || source[lookahead] !== "}") return;

        const codePoint = parseInt(source.substring(pos + 2, lookahead), 16);
        if (codePoint <= 0x10ffff) {
            return [String.fromCodePoint(codePoint), lookahead + 1];
        }
    }
}

// String:: `"` StringCharacters? `"`
// StringCharacters:: StringCharacter StringCharacters?
// StringCharacter::
//   SourceCharacter but not one of `"` or `\` or LineTerminator
//   `\` EscapeSequence
function parseString(
    source: string,
    pos: number,
    end: number
): [string, number] | undefined {
    let result = "";

    if (source[pos++] !== '"') return;

    while (pos < end) {
        if (source[pos] === '"') {
            return [result, pos + 1];
        }

        if (LineTerminator.includes(source[pos])) return;

        if (source[pos] === "\\") {
            const esc = parseEscapeSequence(source, pos + 1, end);
            if (!esc) return;

            result += esc[0];
            pos = esc[1];
            continue;
        }

        result += source[pos++];
    }
}

// ModuleSource:: String | ModuleSourceCharacters
function parseModuleSource(
    source: string,
    pos: number,
    end: number
): [string, number] | undefined {
    pos = skipWs(source, pos, end);
    if (pos >= end) return;

    if (source[pos] === '"') {
        return parseString(source, pos, end);
    }

    let lookahead = pos;
    while (
        lookahead < end &&
        !('"!' + LineTerminator).includes(source[lookahead])
    ) {
        lookahead++;
    }

    if (lookahead === pos) return;

    return [source.substring(pos, lookahead), lookahead];
}

// SymbolReference:
//     ComponentPath Meaning?
//     Meaning
// ComponentPath:
//     Component
//     ComponentPath `.` Component                      // Navigate via 'exports' of |ComponentPath|
//     ComponentPath `#` Component                      // Navigate via 'members' of |ComponentPath|
//     ComponentPath `~` Component                      // Navigate via 'locals' of |ComponentPath|
// Meaning:
//     `:` MeaningKeyword                            // Indicates the meaning of a symbol (i.e. ':class')
//     `:` MeaningKeyword `(` DecimalDigits `)`      // Indicates an overloaded meaning (i.e. ':function(1)')
//     `:` `(` DecimalDigits `)`                     // Shorthand for an overloaded meaning (i.e. `:(1)`)
//     `:` DecimalDigits                             // Shorthand for an overloaded meaning (i.e. ':1')
function parseSymbolReference(source: string, pos: number, end: number) {
    //
}

// // NOTE: The following grammar is incorrect as |SymbolReference| and |ModuleSource| have an
// //       ambiguous parse. The correct solution is to use a cover grammar to parse
// //       |SymbolReference| until we hit a `!` and then reinterpret the grammar.
// DeclarationReference:
//   [empty]
//   SymbolReference                               // Shorthand reference to symbol
//   ModuleSource `!`                              // Reference to a module
//   ModuleSource `!` SymbolReference              // Reference to an export of a module
//   ModuleSource `!` `~` SymbolReference          // Reference to a local of a module
//   `!` SymbolReference                           // Reference to global symbol
export function parseDeclarationReference(
    source: string
): [DeclarationReference, number] | undefined {
    const end = source.length;
    let pos = skipWs(source, 0, end);

    let moduleSource: string | undefined;
    let resolutionStart: "global" | "local" = "local";

    const moduleSourceOrSymbolRef = parseModuleSource(source, pos, end);
    if (moduleSourceOrSymbolRef) {
        if (
            moduleSourceOrSymbolRef[1] < end &&
            source[moduleSourceOrSymbolRef[1]] === "!"
        ) {
            // We had a module source!
            pos = moduleSourceOrSymbolRef[1] + 1;
            resolutionStart = "global";
            moduleSource = moduleSourceOrSymbolRef[0];
        }
    }

    const symbolReference = parseSymbolReference(source, pos, end);

    return [
        {
            moduleSource,
            resolutionStart,
        },
        pos,
    ];
}

export interface DeclarationReference {
    resolutionStart: "global" | "local";
    moduleSource?: string;
}

if (require.main === module) {
    const strings = [
        '"abc\\x41\\u0041\\u{42}z"!',
        "!a",
        "abc.def",
        "ab:var",
        "abcdefghi | hi",
    ];

    for (const str of strings) {
        console.log(str);
        console.log(parseDeclarationReference(str));
    }
}
