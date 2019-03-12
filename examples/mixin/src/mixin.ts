export type AnyFunction<A = any> = (...input: any[]) => A
export type AnyConstructor<A = object> = new (...input: any[]) => A

export type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>


export class Base {
    initialize () {
    }
}

export const SomeMixinFunc = <T extends AnyConstructor<Base>>(base : T) =>

// internal mixin class
class SomeMixinClass extends base {
    someProperty : string = 'initialValue'


    someMethod (arg : SomeMixinType, somethingElse : RegularInterface) : SomeMixinType[] {
        return [ arg, this ]
    }
}

// the "instance type" of this mixin
// export type SomeMixin = Mixin<typeof SomeMixin>
// or (supports recursive type definition)
export interface SomeMixinType extends Mixin<typeof SomeMixinFunc> {}


interface RegularInterface extends Base {
    regularInterfaceProperty        : string
}
