// Conversion order test for @link

export interface One extends Two {}

/** {@link method1} */
export interface Two {
    method1(): string;
}

/** {@link method2} */
export interface Three {
    method2(): string;
}

export interface Four extends Three {}
