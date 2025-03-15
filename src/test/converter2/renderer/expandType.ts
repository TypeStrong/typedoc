export type Expandable = {
    /** A */
    a: string;
};

/** @expand */
export interface ExpandedByDefault {
    /** B */
    b: string;
}

export type Expandable2 = {
    /** C */
    c: string;
};

/**
 * @expandType Expandable
 * @preventExpand ExpandedByDefault
 */
export type AExpanded = { a: Expandable; b: ExpandedByDefault; c: Expandable2 };

// Defaults are fine
export type BExpanded = { a: Expandable; b: ExpandedByDefault; c: Expandable2 };

/**
 * @expandType Expandable
 * @expandType Expandable2
 */
export namespace NestedBehavior1 {
    export type AllExpanded = { a: Expandable; b: ExpandedByDefault; c: Expandable2 };
    /**
     * @preventExpand Expandable
     * @preventExpand Expandable2
     */
    export type AExpanded = { a: Expandable; b: ExpandedByDefault; c: Expandable2 };
}
