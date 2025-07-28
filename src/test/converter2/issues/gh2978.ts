export interface Parent {
    prop: string;
}

export interface Child extends Partial<Parent> {}

export type Tricky<T> = Omit<T, "x"> & { x: number };

export interface HasX {
    x: string;
}

export interface InheritsX extends Tricky<HasX> {
    // InheritsX.x should *not* be linked to HasX.x
}
