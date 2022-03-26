import { SomeType, ReflectionType, ReferenceType } from "../types";
import { Reflection, TraverseProperty, TraverseCallback } from "./abstract";
import type { ParameterReflection } from "./parameter";
import type { TypeParameterReflection } from "./type-parameter";
import type { DeclarationReflection } from "./declaration";
import type { ReflectionKind } from "./kind";
import type { Serializer, JSONOutput } from "../../serialization";

export class SignatureReflection extends Reflection {
    constructor(
        name: string,
        kind: SignatureReflection["kind"],
        parent: DeclarationReflection
    ) {
        super(name, kind, parent);
    }

    override kind!:
        | ReflectionKind.SetSignature
        | ReflectionKind.GetSignature
        | ReflectionKind.IndexSignature
        | ReflectionKind.CallSignature
        | ReflectionKind.ConstructorSignature;

    override parent!: DeclarationReflection;

    parameters?: ParameterReflection[];

    typeParameters?: TypeParameterReflection[];

    type?: SomeType;

    /**
     * A type that points to the reflection that has been overwritten by this reflection.
     *
     * Applies to interface and class members.
     */
    overwrites?: ReferenceType;

    /**
     * A type that points to the reflection this reflection has been inherited from.
     *
     * Applies to interface and class members.
     */
    inheritedFrom?: ReferenceType;

    /**
     * A type that points to the reflection this reflection is the implementation of.
     *
     * Applies to class members.
     */
    implementationOf?: ReferenceType;

    /**
     * Traverse all potential child reflections of this reflection.
     *
     * The given callback will be invoked for all children, signatures and type parameters
     * attached to this reflection.
     *
     * @param callback  The callback function that should be applied for each child reflection.
     */
    override traverse(callback: TraverseCallback) {
        if (this.type instanceof ReflectionType) {
            if (
                callback(
                    this.type.declaration,
                    TraverseProperty.TypeLiteral
                ) === false
            ) {
                return;
            }
        }

        for (const parameter of this.typeParameters ?? []) {
            if (callback(parameter, TraverseProperty.TypeParameter) === false) {
                return;
            }
        }

        for (const parameter of this.parameters ?? []) {
            if (callback(parameter, TraverseProperty.Parameters) === false) {
                return;
            }
        }

        super.traverse(callback);
    }

    /**
     * Return a string representation of this reflection.
     */
    override toString(): string {
        let result = super.toString();

        if (this.typeParameters) {
            const parameters: string[] = this.typeParameters.map(
                (parameter) => parameter.name
            );
            result += "<" + parameters.join(", ") + ">";
        }

        if (this.type) {
            result += ":" + this.type.toString();
        }

        return result;
    }

    override toObject(serializer: Serializer): JSONOutput.SignatureReflection {
        return {
            ...super.toObject(serializer),
            typeParameter:
                this.typeParameters && this.typeParameters.length > 0
                    ? this.typeParameters.map((type) =>
                          serializer.toObject(type)
                      )
                    : undefined,
            parameters:
                this.parameters && this.parameters.length > 0
                    ? this.parameters.map((type) => serializer.toObject(type))
                    : undefined,
            type: this.type && serializer.toObject(this.type),
            overwrites: this.overwrites && serializer.toObject(this.overwrites),
            inheritedFrom:
                this.inheritedFrom && serializer.toObject(this.inheritedFrom),
            implementationOf:
                this.implementationOf &&
                serializer.toObject(this.implementationOf),
        };
    }
}
