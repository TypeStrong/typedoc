import { Type } from './abstract';

/**
 * Represents a type operator type.
 *
 * ~~~
 * class A {}
 * class B<T extends keyof A> {}
 * ~~~
 */
export class TypeOperatorType extends Type {
    /**
     * The type name identifier.
     */
    readonly type: string = 'typeOperator';

    target: Type;

    // currently, there is only one type operator, this is always "keyof"
    // but, if more types will be added in the future we are ready.
    operator: 'keyof' = 'keyof';

    constructor(target: Type) {
        super();
        this.target = target;
    }

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        return new TypeOperatorType(this.target.clone());
    }

    /**
     * Test whether this type equals the given type.
     *
     * @param type  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(type: TypeOperatorType): boolean {
        if (!(type instanceof TypeOperatorType)) {
            return false;
        }

        return type.target.equals(this.target);
    }

    /**
     * Return a raw object representation of this type.
     */
    toObject(): any {
        const result: any = super.toObject();
        result.operator = this.operator;
        result.target = this.target.toObject();
        return result;
    }

    /**
     * Return a string representation of this type.
     */
    toString() {
        return `keyof ${this.target.toString()}`;
    }
}
