export interface ReadonlyCharMap extends Iterable<string> {
    at(x: number): string;
}

export class CharMap implements ReadonlyCharMap {
    at() {
        return "";
    }

    *[Symbol.iterator](): Iterator<string> {}
}
