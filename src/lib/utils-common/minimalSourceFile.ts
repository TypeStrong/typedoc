// Type only import is permitted
// eslint-disable-next-line no-restricted-imports
import type { LineAndCharacter, SourceFileLike } from "typescript";
import { binaryFindPartition } from "./array.js";
import type { NormalizedPath } from "./path.js";

// I don't like this, but it's necessary so that the lineStarts property isn't
// visible in the `MinimalSourceFile` type. Even when private it causes compilation
// errors downstream.
const lineStarts = new WeakMap<MinimalSourceFile, number[]>();

export interface MinimalNode {
    // This is actually getStart(sourceFile: ts.SourceFile, includeJsDocComments: boolean): number
    // but we define it with this signature so that `ts.Node` is assignable to it.
    getStart(): number;
    getSourceFile(): MinimalSourceFile;
}

export class MinimalSourceFile implements SourceFileLike {
    readonly text: string;
    // This type is just string to ensure assignability from SourceFile
    readonly fileName: string;

    constructor(
        text: string,
        fileName: NormalizedPath,
    ) {
        // This is unfortunate, but the yaml library we use relies on the source
        // text using LF line endings https://github.com/eemeli/yaml/issues/127.
        // If we don't do this, in a simple document which includes a single key
        // like:
        // ---<CR><LF>
        // title: Windows line endings<CR><LF>
        // ---<CR><LF>
        // we'll end up with a parsed title of "Windows line endings\r"
        this.text = text.replaceAll("\r\n", "\n");
        lineStarts.set(this, [0]);

        this.fileName = fileName;
    }

    getLineAndCharacterOfPosition(pos: number): LineAndCharacter {
        if (pos < 0 || pos >= this.text.length) {
            throw new Error("pos must be within the range of the file.");
        }

        const starts = lineStarts.get(this)!;
        while (pos >= starts[starts.length - 1]) {
            const nextStart = this.text.indexOf(
                "\n",
                starts[starts.length - 1],
            );

            if (nextStart === -1) {
                starts.push(Infinity);
            } else {
                starts.push(nextStart + 1);
            }
        }

        const line = binaryFindPartition(starts, (x) => x > pos) - 1;

        return {
            character: pos - starts[line],
            line,
        };
    }
}
