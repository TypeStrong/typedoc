export namespace MultipleInheritance {
    export interface Foundation {}
    export interface Base extends Foundation {}
    export interface Branch extends Base {}
    export interface Base2 {}
    export interface Combined extends Branch, Base2 {}
    export interface CombinedChild extends Combined {}
    export interface CombinedChild2 extends Combined {}
    export interface Base3 {}
    export interface CombinedGrandchild extends CombinedChild2, Base3 {}
    export interface DiamondDiamond extends CombinedChild, CombinedGrandchild {}
}

export namespace Generics {
    export interface Foundation<T> {}
    export interface Base<TItem> extends Foundation<TItem> {}
    export interface Item {}
    export interface Child extends Base<Item[]> {}
}
