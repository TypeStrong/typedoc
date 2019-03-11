export type AnyFunction<A = any> = (...input: any[]) => A
export type AnyConstructor<A = object> = new (...input: any[]) => A

export type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>


export class Base {
    initialize () {
    }
}

export const SomeMixin = <T extends AnyConstructor<Base>>(base : T) =>

// internal mixin class
class SomeMixin extends base {
    someProperty : string = 'initialValue'

    someMethod (arg : SomeMixin) : SomeMixin[] {
        return [ arg, this ]
    }
}

// the "instance type" of this mixin
// export type SomeMixin = Mixin<typeof SomeMixin>
// or (supports recursive type definition)
export interface SomeMixin extends Mixin<typeof SomeMixin> {}
