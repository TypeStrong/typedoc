export namespace A {
    export const definedInA = true;
    export import definedInB = B.definedInB; // Alias
}

export namespace B {
    export import definedInA = A.definedInA; // Alias
    export const definedInB = true;
}
