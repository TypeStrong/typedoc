import { Reflection } from '../reflections/abstract';
import { Type } from './abstract';

/**
 * Represents a type that refers to another reflection like a class, interface or enum.
 *
 * ~~~
 * let value: MyClass;
 * ~~~
 */
export class ReferenceType extends Type {
    /**
     * The type name identifier.
     */
    readonly type: string = 'reference';

    /**
     * The name of the referenced type.
     *
     * If the symbol cannot be found cause it's not part of the documentation this
     * can be used to represent the type.
     */
    name: string;

    /**
     * The type arguments of this reference.
     */
    typeArguments?: Type[];

    /**
     * The symbol id of the referenced type as returned from the TypeScript compiler.
     *
     * After the all reflections have been generated this is can be used to lookup the
     * relevant reflection with [[ProjectReflection.symbolMapping]].
     */
    symbolID: number;

    /**
     * The resolved reflection.
     *
     * The [[TypePlugin]] will try to set this property in the resolving phase.
     */
    reflection?: Reflection;

    /**
     * Special symbol ID noting that the reference of a ReferenceType was known when creating the type.
     */
    static SYMBOL_ID_RESOLVED = -1;

    /**
     * Special symbol ID noting that the reference should be resolved by the type name.
     */
    static SYMBOL_ID_RESOLVE_BY_NAME = -2;

    /**
     * Create a new instance of ReferenceType.
     *
     * @param name        The name of the referenced type.
     * @param symbolID    The symbol id of the referenced type as returned from the TypeScript compiler.
     * @param reflection  The resolved reflection if already known.
     */
    constructor(name: string, symbolID: number, reflection?: Reflection) {
        super();
        this.name = name;
        this.symbolID = symbolID;
        this.reflection = reflection;
    }

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        const clone = new ReferenceType(this.name, this.symbolID, this.reflection);
        clone.typeArguments = this.typeArguments;
        return clone;
    }

    /**
     * Test whether this type equals the given type.
     *
     * @param type  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(type: ReferenceType): boolean {
        return type instanceof ReferenceType &&
            (type.symbolID === this.symbolID || type.reflection === this.reflection);
    }

    /**
     * Return a raw object representation of this type.
     * @deprecated Use serializers instead
     */
    toObject(): any {
        const result: any = super.toObject();
        result.name = this.name;

        if (this.reflection) {
            result.id = this.reflection.id;
        }

        if (this.typeArguments && this.typeArguments.length) {
            result.typeArguments = this.typeArguments.map((t) => t.toObject());
        }

        return result;
    }

    /**
     * Return a string representation of this type.
     * @example EventEmitter<any>
     */
    toString() {
        const name = this.reflection ? this.reflection.name : this.name;
        let typeArgs = '';
        if (this.typeArguments) {
            typeArgs += '<';
            typeArgs += this.typeArguments.map(arg => arg.toString()).join(', ');
            typeArgs += '>';
        }

        return name + typeArgs;
    }
}
