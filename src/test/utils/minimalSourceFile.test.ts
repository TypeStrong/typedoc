import { deepStrictEqual as equal, throws } from "assert";
import type { LineAndCharacter } from "typescript";
import { MinimalSourceFile } from "../../lib/utils/minimalSourceFile";

describe("MinimalSourceFile", () => {
    it("Should do bounds checking", () => {
        const sf = new MinimalSourceFile("abc\n123\n4\n5", "");

        throws(() => sf.getLineAndCharacterOfPosition(-1));
        throws(() => sf.getLineAndCharacterOfPosition(1000));
    });

    it("Should support calculating lines", () => {
        const sf = new MinimalSourceFile("abc\n123\n4\n5", "");

        const check = (s: string, pos: LineAndCharacter) =>
            equal(sf.getLineAndCharacterOfPosition(sf.text.indexOf(s)), pos);

        check("a", { line: 0, character: 0 });
        check("b", { line: 0, character: 1 });
        check("\n", { line: 0, character: 3 });
        check("1", { line: 1, character: 0 });
        check("2", { line: 1, character: 1 });
        check("4", { line: 2, character: 0 });
        check("5", { line: 3, character: 0 });
    });

    it("#2605 Should handle multiple consecutive newlines", () => {
        const sf = new MinimalSourceFile("a\n\nb", "");

        equal(sf.getLineAndCharacterOfPosition(0), { line: 0, character: 0 }); // a
        equal(sf.getLineAndCharacterOfPosition(1), { line: 0, character: 1 }); // \n
        equal(sf.getLineAndCharacterOfPosition(2), { line: 1, character: 0 }); // \n
        equal(sf.getLineAndCharacterOfPosition(3), { line: 2, character: 0 }); // b
    });
});
