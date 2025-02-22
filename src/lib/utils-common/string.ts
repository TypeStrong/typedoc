import { DefaultMap } from "./map.js";

/**
 * Resolves a string type into a union of characters, `"ab"` turns into `"a" | "b"`.
 */
export type Chars<T extends string> = T extends `${infer C}${infer R}` ? C | Chars<R> :
    never;

/** Count the number of times `search` appears in `text` */
export function countMatches(text: string, search: string) {
    let count = 0;
    let last = 0;
    for (;;) {
        const index = text.indexOf(search, last);
        if (index === -1) {
            break;
        } else {
            last = index + 1;
            ++count;
        }
    }

    return count;
}

export function dedent(text: string) {
    const lines = text.split(/\r?\n/);
    while (lines.length && lines[0].search(/\S/) === -1) {
        lines.shift();
    }
    while (lines.length && lines[lines.length - 1].search(/\S/) === -1) {
        lines.pop();
    }

    const minIndent = lines.reduce(
        (indent, line) => line.length ? Math.min(indent, line.search(/\S/)) : indent,
        Infinity,
    );

    return lines.map((line) => line.substring(minIndent)).join("\n");
}

// Based on https://en.wikipedia.org/wiki/Levenshtein_distance#Iterative_with_two_matrix_rows
// Slightly modified for improved match results for options
export function editDistance(s: string, t: string): number {
    if (s.length < t.length) return editDistance(t, s);

    let v0 = Array.from({ length: t.length + 1 }, (_, i) => i);
    let v1 = Array.from({ length: t.length + 1 }, () => 0);

    for (let i = 0; i < s.length; i++) {
        v1[0] = i + 1;

        for (let j = 0; j < s.length; j++) {
            const deletionCost = v0[j + 1] + 1;
            const insertionCost = v1[j] + 1;
            let substitutionCost: number;
            if (s[i] === t[j]) {
                substitutionCost = v0[j];
            } else if (s[i]?.toUpperCase() === t[j]?.toUpperCase()) {
                substitutionCost = v0[j] + 1;
            } else {
                substitutionCost = v0[j] + 3;
            }

            v1[j + 1] = Math.min(deletionCost, insertionCost, substitutionCost);
        }

        [v0, v1] = [v1, v0];
    }

    return v0[t.length];
}

export function getSimilarValues(values: Iterable<string>, compareTo: string) {
    const results = new DefaultMap<number, string[]>(() => []);
    let lowest = Infinity;
    for (const name of values) {
        const distance = editDistance(compareTo, name);
        lowest = Math.min(lowest, distance);
        results.get(distance).push(name);
    }

    // Experimenting a bit, it seems an edit distance of 3 is roughly the
    // right metric for relevant "similar" results without showing obviously wrong suggestions
    return results
        .get(lowest)
        .concat(results.get(lowest + 1), results.get(lowest + 2));
}

// From MDN
export function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
