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

export function debugFlags(Enum: {}, flags: number): string[] {
    return getEnumKeys(Enum).filter(
        (key) => ((Enum as any)[key] & flags) === (Enum as any)[key],
    );
}

// Note: String enums are not handled.
export function getEnumKeys(Enum: {}): string[] {
    const E = Enum as any;
    return Object.keys(E).filter((k) => E[E[k]] === k);
}

export type EnumKeys<E extends {}> = keyof {
    [K in keyof E as number extends E[K] ? K : never]: 1;
};
