/**
 * Has docs
 */
export function documented() {}

/**
 * Some signatures with docs
 */
export function documented2(): void;
export function documented2(x: number): number;
export function documented2(x?: number) {
    return x;
}

export function notDocumented() {}

/** Docs */
export class Docs {
    /** Docs */
    get x() {
        return 1;
    }
    /** Docs */
    set x(value: number) {
        throw value;
    }

    /** Docs */
    get y() {
        return 2;
    }
    set y(value: number) {
        throw value;
    }

    get z() {
        return 3;
    }
}
