interface MixinConstructor<B extends new (...args: any) => U, U> {
    new (...args: ConstructorParameters<B>): U;
}

export declare class DOMBase<T extends Node> {
    [Symbol.iterator](): Iterator<T>;
}

export interface DOMIterable extends Partial<DOMBase<Node>> {
}

declare const DOMClass_base: MixinConstructor<typeof DOMBase, DOMBase<Node> & object>;

export declare class DOMClass extends DOMClass_base {
    private constructor();
}
