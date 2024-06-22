import type { LineAndCharacter, SourceFileLike } from "typescript";
import { binaryFindPartition } from "./array";

// I don't like this, but it's necessary so that the lineStarts property isn't
// visible in the `MinimalSourceFile` type. Even when private it causes compilation
// errors downstream.
const lineStarts = new WeakMap<MinimalSourceFile, number[]>();

export class MinimalSourceFile implements SourceFileLike {
    constructor(
        readonly text: string,
        readonly fileName: string,
    ) {
        lineStarts.set(this, [0]);
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
