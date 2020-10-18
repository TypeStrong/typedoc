import type * as ts from "typescript";
import type { ProjectReflection } from "../reflections";
import { Reflection } from "../reflections/abstract";
import { Type } from "./abstract";

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
    readonly type = "reference";

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
     * The resolved reflection.
     *
     * The [[TypePlugin]] will try to set this property in the resolving phase.
     */
    get reflection() {
        if (this._target instanceof Reflection) {
            return this._target;
        }
        const resolved = this._project.getReflectionFromSymbol(this._target);
        if (resolved) this._target = resolved;
        return resolved;
    }

    private _target: ts.Symbol | Reflection;
    private _project: ProjectReflection;

    /**
     * Create a new instance of ReferenceType.
     */
    constructor(
        name: string,
        target: ts.Symbol | Reflection,
        project: ProjectReflection
    ) {
        super();
        this.name = name;
        this._target = target;
        this._project = project;
    }

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        const clone = new ReferenceType(this.name, this._target, this._project);
        clone.typeArguments = this.typeArguments;
        return clone;
    }

    /**
     * Test whether this type equals the given type.
     *
     * @param other  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(other: ReferenceType): boolean {
        return (
            other instanceof ReferenceType &&
            other.reflection === this.reflection
        );
    }

    /**
     * Return a string representation of this type.
     * @example EventEmitter<any>
     */
    toString() {
        const name = this.reflection ? this.reflection.name : this.name;
        let typeArgs = "";
        if (this.typeArguments) {
            typeArgs += "<";
            typeArgs += this.typeArguments
                .map((arg) => arg.toString())
                .join(", ");
            typeArgs += ">";
        }

        return name + typeArgs;
    }
}
