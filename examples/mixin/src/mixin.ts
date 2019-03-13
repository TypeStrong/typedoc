export type AnyFunction<A = any> = (...input: any[]) => A
export type AnyConstructor<A = object> = new (...input: any[]) => A

export type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>


export class Base {
    baseProperty    : string = 'init'

    baseMethod () : number {
        return 42
    }
}

export const Mixin1Func = <T extends AnyConstructor<Base>>(base : T) =>

// internal mixin class
class Mixin1Class extends base {
    property1 : string = 'init'


    method1 (arg : Mixin1Type) : Mixin1Type[] {
        return [ arg, this ]
    }
}

// the "instance type" of this mixin
// export type Mixin1 = Mixin<typeof Mixin1>

// or, alternative notation (supports recursive type definition)
export interface Mixin1Type extends Mixin<typeof Mixin1Func> {}


export const Mixin2 = <T extends AnyConstructor<Mixin1Type & Base>>(base : T) =>


// internal mixin class
class Mixin2 extends base {
    property2 : string = 'init'


    method2 (arg : Mixin1Type) : Mixin1Type[] {
        return [ arg ]
    }
}

// the "instance type" of this mixin
// export type Mixin1 = Mixin<typeof Mixin1>

// or, alternative notation (supports recursive type definition)
export interface Mixin2I extends Mixin<typeof Mixin2> {}



export class SomeClassWithMixin extends Mixin2(Mixin1Func(Base)) {
    classWithMixinProperty  : string = 'init'

    classWithMixinMethod () : string {
        return '42'
    }
}
