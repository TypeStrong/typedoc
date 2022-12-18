export function getEnumFlags<T extends number>(flags: T): T[] {
    const result: T[] = [];
    for (let i = 1; i <= flags; i <<= 1) {
        if (flags & i) {
            result.push(i as T);
        }
    }

    return result;
}

// T & {} reduces inference priority
export function removeFlag<T extends number>(flag: T, remove: T & {}): T {
    return (flag & ~remove) as T;
}

export function hasAllFlags(flags: number, check: number): boolean {
    return (flags & check) === check;
}

export function hasAnyFlag(flags: number, check: number): boolean {
    return (flags & check) !== 0;
}

// Note: String enums are not handled.
export function getEnumKeys(Enum: Record<string, string | number>): string[] {
    return Object.keys(Enum).filter((k) => {
        return Enum[Enum[k]] === k;
    });
}
