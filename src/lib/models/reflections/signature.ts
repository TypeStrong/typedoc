import { Type, ReflectionType, ReferenceType } from "../types/index";
import {
    Reflection,
    TypeContainer,
    TypeParameterContainer,
    TraverseProperty,
    TraverseCallback,
    ReflectionKind,
} from "./abstract";
import { ParameterReflection } from "./parameter";
import { TypeParameterReflection } from "./type-parameter";
import { toArray } from "lodash";
import type { DeclarationReflection } from "./declaration";

export class SignatureReflection
    extends Reflection
    implements TypeContainer, TypeParameterContainer {
    /**
     * Create a new SignatureReflection to contain a specific type of signature.
     */
    constructor(
        name: string,
        kind: SignatureReflection["kind"],
        parent: DeclarationReflection
    ) {
        super(name, kind, parent);
    }

    kind!:
        | ReflectionKind.SetSignature
        | ReflectionKind.GetSignature
        | ReflectionKind.IndexSignature
        | ReflectionKind.CallSignature
        | ReflectionKind.ConstructorSignature;

    parent!: DeclarationReflection;

    parameters?: ParameterReflection[];

    typeParameters?: TypeParameterReflection[];

    type?: Type;

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
     * Return an array of the parameter types.
     */
    getParameterTypes(): Type[] {
        if (!this.parameters) {
            return [];
        }
        function notUndefined<T>(t: T | undefined): t is T {
            return !!t;
        }
        return this.parameters
            .map((parameter) => parameter.type)
            .filter(notUndefined);
    }

    /**
     * Traverse all potential child reflections of this reflection.
     *
     * The given callback will be invoked for all children, signatures and type parameters
     * attached to this reflection.
     *
     * @param callback  The callback function that should be applied for each child reflection.
     */
    traverse(callback: TraverseCallback) {
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

        for (const parameter of toArray(this.typeParameters)) {
            if (callback(parameter, TraverseProperty.TypeParameter) === false) {
                return;
            }
        }

        for (const parameter of toArray(this.parameters)) {
            if (callback(parameter, TraverseProperty.Parameters) === false) {
                return;
            }
        }

        super.traverse(callback);
    }

    /**
     * Return a string representation of this reflection.
     */
    toString(): string {
        let result = super.toString();

        if (this.typeParameters) {
            const parameters: string[] = [];
            this.typeParameters.forEach((parameter) =>
                parameters.push(parameter.name)
            );
            result += "<" + parameters.join(", ") + ">";
        }

        if (this.type) {
            result += ":" + this.type.toString();
        }

        return result;
    }
}
